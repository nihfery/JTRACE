// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract JTrace {
    struct Record {
        uint256 id;
        address patient;
        address uploader;
        string ipfsHash;
        string recordType;
        uint256 timestamp;
    }

    uint256 public recordCount;
    mapping(uint256 => Record) public records;
    mapping(address => mapping(address => bool)) public accessGranted;

    event RecordAdded(
        uint256 id,
        address indexed patient,
        address indexed uploader,
        string ipfsHash,
        string recordType,
        uint256 timestamp
    );

    event AccessGranted(address indexed patient, address indexed faskes);
    event AccessRevoked(address indexed patient, address indexed faskes);

    // 🔹 Tambah rekam medis baru
    function addRecord(string memory _ipfsHash, string memory _recordType) public {
        recordCount++;
        records[recordCount] = Record(
            recordCount,
            msg.sender,     // pasien (pemilik data)
            msg.sender,     // uploader (sementara sama, bisa diubah nanti)
            _ipfsHash,
            _recordType,
            block.timestamp
        );
        emit RecordAdded(recordCount, msg.sender, msg.sender, _ipfsHash, _recordType, block.timestamp);
    }

    // 🔹 Pasien memberi izin akses ke faskes tertentu
    function grantAccess(address _faskes) public {
        accessGranted[msg.sender][_faskes] = true;
        emit AccessGranted(msg.sender, _faskes);
    }

    // 🔹 Pasien mencabut izin akses
    function revokeAccess(address _faskes) public {
        accessGranted[msg.sender][_faskes] = false;
        emit AccessRevoked(msg.sender, _faskes);
    }

    // 🔹 Faskes membaca data pasien (jika diberi izin)
    function getRecord(uint256 _id) public view returns (
        uint256,
        address,
        address,
        string memory,
        string memory,
        uint256
    ) {
        Record memory rec = records[_id];
        require(
            msg.sender == rec.patient || accessGranted[rec.patient][msg.sender],
            "No access to this record"
        );
        return (rec.id, rec.patient, rec.uploader, rec.ipfsHash, rec.recordType, rec.timestamp);
    }
}
