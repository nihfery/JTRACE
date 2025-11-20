import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { UploadCloud } from "lucide-react";
import contractAbi from "../abi/Jtrace.json";

// Alamat kontrak
const contractAddress = "0x7C162430F7D622A485D095F5C1cA87F38e0C7e70";

// Pinata (jangan commit ini ke GitHub publik!)
const PINATA_API_KEY = "e5b20ba77a9a33be3ed2";
const PINATA_SECRET_KEY = "c2c8578a5eb875f825fd57e12934cbbc8f124d4d2b215e29f3527425879d35de";

export default function UploadRecord() {
  const { address } = useAccount();

  const [form, setForm] = useState({
    patientName: "",
    noPesertaJKN: "",
    diagnosis: "",
    treatment: "",
    doctorName: "",
    faskesName: "",
    visitDate: "",
    attachments: "",
    signature: "",
    hashVerification: "",
  });

  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { writeContractAsync, isPending } = useWriteContract();
  const { data: receipt, isLoading: isWaitingReceipt } =
    useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==========================
  // 1️⃣ Upload JSON ke IPFS
  // ==========================
  const handleUploadToIPFS = async () => {
    setError("");
    setIsUploading(true);

    try {
      const payload = {
        pinataMetadata: {
          name: `Record_${form.patientName}_${form.visitDate}`,
        },
        pinataContent: {
          ...form,
          attachments: form.attachments
            ? form.attachments.split(",").map((a) => a.trim())
            : [],
          walletUploader: address,
        },
      };

      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.IpfsHash) {
        setIpfsHash(data.IpfsHash);
      } else {
        setError("Pinata error: API KEY atau struktur payload salah.");
      }
    } catch (err) {
      setError("Upload ke IPFS gagal. Cek API key dan koneksi.");
    }

    setIsUploading(false);
  };

  // ==================================
  // 2️⃣ Kirim hash IPFS → Blockchain
  // ==================================
  const handleSendToBlockchain = async () => {
    if (!ipfsHash)
      return setError("Upload IPFS dulu.");

    try {
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: "addRecord",
        args: [ipfsHash, form.diagnosis || "General Record"],
      });

      setTxHash(tx);

      setForm({
        patientName: "",
        noPesertaJKN: "",
        diagnosis: "",
        treatment: "",
        doctorName: "",
        faskesName: "",
        visitDate: "",
        attachments: "",
        signature: "",
        hashVerification: "",
      });

      setIpfsHash(null);
    } catch (err: any) {
      setError("Blockchain error: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-900/50 border border-white/10 rounded-lg p-6 mt-32">
      <h2 className="text-2xl font-bold mb-4">Upload Medical Record</h2>

      {error && <div className="p-3 bg-red-600/20 text-red-400 rounded">{error}</div>}

      {/* FORM */}
      <form className="space-y-3">
        {[
          { label: "Nama Pasien (AES)", name: "patientName" },
          { label: "No Peserta JKN", name: "noPesertaJKN" },
          { label: "Diagnosis", name: "diagnosis" },
          { label: "Tindakan", name: "treatment" },
          { label: "Nama Dokter", name: "doctorName" },
          { label: "Nama Faskes", name: "faskesName" },
          { label: "Tanggal", name: "visitDate", type: "date" },
          { label: "Lampiran (comma)", name: "attachments" },
          { label: "Signature", name: "signature" },
          { label: "Hash Verifikasi", name: "hashVerification" },
        ].map((f) => (
          <div key={f.name}>
            <label className="text-gray-400 text-sm">{f.label}</label>
            <input
              type={f.type || "text"}
              name={f.name}
              value={(form as any)[f.name]}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            />
          </div>
        ))}
      </form>

      {/* Upload ke IPFS */}
      <button
        onClick={handleUploadToIPFS}
        disabled={isUploading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg mt-4 flex items-center justify-center gap-2"
      >
        <UploadCloud /> {isUploading ? "Uploading..." : "Upload ke IPFS"}
      </button>

      {ipfsHash && (
        <div className="mt-4 bg-gray-800 p-3 rounded text-gray-200">
          <p>
            Berhasil:{" "}
            <a className="text-blue-400 underline"
              href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank">
              {ipfsHash}
            </a>
          </p>

          <button
            onClick={handleSendToBlockchain}
            disabled={isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg mt-3"
          >
            {isPending ? "Mengirim..." : "Kirim Hash ke Blockchain"}
          </button>
        </div>
      )}

      {txHash && (
        <div className="mt-4 text-sm text-gray-300">
          <p>
            TX Hash:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              className="text-blue-400 underline"
            >
              {txHash.slice(0, 12)}...
            </a>
          </p>
          {isWaitingReceipt && <p>Menunggu konfirmasi...</p>}
          {receipt && (
            <p className="text-green-400">Confirmed in block {receipt.blockNumber}</p>
          )}
        </div>
      )}
    </div>
  );
}
