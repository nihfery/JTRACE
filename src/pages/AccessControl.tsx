import { useState, useEffect } from "react";
import {
  useWriteContract,
  useAccount,
  useReadContract,
} from "wagmi";
import { KeyRound, Lock, Unlock } from "lucide-react";
import contractAbi from "../abi/JTrace.json";

const contractAddress = "0x7C162430F7D622A485D095F5C1cA87F38e0C7e70";

export default function AccessControl() {
  const { address } = useAccount();

  const [faskesAddress, setFaskesAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [accessList, setAccessList] = useState<{ addr: string; granted: boolean }[]>([]);

  const { writeContractAsync, isPending } = useWriteContract();

  // 🔹 fungsi membaca 1 akses faskes (hook tidak bisa dinamis, kita panggil manual)
  const checkAccess = async (faskes: string) => {
    try {
      const granted = await new Promise<boolean>((resolve) => {
        const { data } = useReadContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: "accessGranted",
          args: [address, faskes],
        });

        // tunggu 100ms agar hook evaluate (hack standar wagmi)
        setTimeout(() => {
          resolve(Boolean(data));
        }, 150);
      });

      return granted;
    } catch (err) {
      return false;
    }
  };

  // 🔹 load daftar faskes dari localStorage
  useEffect(() => {
    if (!address) return;

    const saved = localStorage.getItem(`faskes_${address}`);
    const parsed = saved ? JSON.parse(saved) : [];

    setAccessList(parsed);

    refreshAccessStatus(parsed);
  }, [address]);

  // 🔹 cek status accessGranted untuk semua faskes
  const refreshAccessStatus = async (list: any[]) => {
    const updated: any[] = [];

    for (const item of list) {
      const granted = await checkAccess(item.addr);
      updated.push({ addr: item.addr, granted });
    }

    setAccessList(updated);
  };

  // 🔹 simpan list ke localStorage
  const saveList = (list: any[]) => {
    if (!address) return;
    localStorage.setItem(`faskes_${address}`, JSON.stringify(list));
  };

  // 1️⃣ Grant Access
  const handleGrant = async () => {
    setError("");
    setSuccess("");

    if (!faskesAddress) return setError("Alamat faskes wajib diisi.");

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: "grantAccess",
        args: [faskesAddress],
      });

      const updated = [
        ...accessList.filter((x) => x.addr !== faskesAddress),
        { addr: faskesAddress, granted: true },
      ];

      setAccessList(updated);
      saveList(updated);
      setSuccess("Akses berhasil diberikan!");
    } catch (err: any) {
      setError("Gagal grant akses: " + err.message);
    }
  };

  // 2️⃣ Revoke Access
  const handleRevoke = async (addr: string) => {
    setError("");
    setSuccess("");

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: "revokeAccess",
        args: [addr],
      });

      const updated = accessList.map((x) =>
        x.addr === addr ? { ...x, granted: false } : x
      );

      setAccessList(updated);
      saveList(updated);
      setSuccess("Akses berhasil dicabut.");
    } catch (err: any) {
      setError("Gagal revoke akses: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-900/50 border border-white/10 rounded-lg p-6 mt-32 backdrop-blur-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <KeyRound className="w-6 h-6 text-emerald-400" />
        Access Control
      </h2>

      {error && <div className="p-3 bg-red-600/20 text-red-400 rounded">{error}</div>}
      {success && <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded">{success}</div>}

      {/* Input Faskes */}
      <div className="mt-4">
        <label className="text-sm text-gray-300 mb-1 block">Alamat Faskes</label>
        <input
          type="text"
          placeholder="0xFaskesAddress..."
          value={faskesAddress}
          onChange={(e) => setFaskesAddress(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />

        <button
          onClick={handleGrant}
          disabled={isPending}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold mt-3"
        >
          {isPending ? "Processing..." : "Grant Access"}
        </button>
      </div>

      {/* Daftar Faskes */}
      <h3 className="text-xl mt-8 mb-3 font-semibold">Daftar Faskes Dengan Akses</h3>

      {accessList.length === 0 && (
        <p className="text-gray-400">Belum ada faskes yang diberikan akses.</p>
      )}

      <div className="space-y-3">
        {accessList.map((item) => (
          <div
            key={item.addr}
            className="flex items-center justify-between bg-gray-800 p-3 rounded"
          >
            <div>
              <div className="text-gray-200">{item.addr}</div>
              <div className="text-sm text-gray-400">
                {item.granted ? "Akses diberikan" : "Tidak ada akses"}
              </div>
            </div>

            {item.granted ? (
              <button
                onClick={() => handleRevoke(item.addr)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center gap-1"
              >
                <Lock className="w-4 h-4" /> Revoke
              </button>
            ) : (
              <button
                onClick={() => setFaskesAddress(item.addr)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-1"
              >
                <Unlock className="w-4 h-4" /> Grant
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
