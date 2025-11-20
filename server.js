// server.js
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ✅ Root check
app.get("/", (req, res) => {
  res.send("✅ Journal DApp API with Prisma + PostgreSQL is running...");
});

/**
 * 1️⃣ Buat/cek user berdasarkan wallet_address
 * - Auto-create jika belum ada
 * - Return existing jika sudah ada
 */
app.post("/api/users", async (req, res) => {
  try {
    const { wallet_address } = req.body;

    if (!wallet_address) {
      return res.status(400).json({ error: "⚠️ wallet_address required" });
    }

    const user = await prisma.user.upsert({
      where: { wallet_address: wallet_address.toLowerCase() },
      update: {},
      create: { wallet_address: wallet_address.toLowerCase() },
    });

    res.json({ message: "✅ User saved/checked", user });
  } catch (err) {
    console.error("❌ User save error:", err);
    res.status(500).json({ error: "❌ Database error" });
  }
});

/**
 * 2️⃣ Simpan journal + detail accounts
 */
app.post("/api/journal", async (req, res) => {
  try {
    const { user_id, reference_no, attachment, tx_hash, accounts } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "⚠️ user_id required" });
    }

    // Buat JournalEntry + nested JournalDetail
    const journal = await prisma.journalEntry.create({
      data: {
        user_id,
        reference_no,
        attachment,
        tx_hash,
        details: {
          create: accounts.map((acc) => ({
            account_no: acc.no,
            account_name: acc.name,
            debit: Number(acc.debit) || 0,
            credit: Number(acc.credit) || 0,
          })),
        },
      },
      include: { details: true, user: true },
    });

    res.json({ message: "✅ Journal saved", journal });
  } catch (err) {
    console.error("❌ Error saving journal:", err);
    res.status(500).json({ error: "❌ Failed to save journal" });
  }
});

/**
 * 3️⃣ Ambil semua journal (nested + user)
 */
app.get("/api/journal_block", async (req, res) => {
  try {
    const journals = await prisma.journalEntry.findMany({
      include: { user: true, details: true },
      orderBy: { created_at: "desc" },
    });

    res.json(journals);
  } catch (err) {
    console.error("❌ Fetch journal_block error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ Ambil journal berdasarkan user_id
 */
app.get("/api/journal_block/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const journals = await prisma.journalEntry.findMany({
      where: { user_id: Number(user_id) },
      include: { user: true, details: true },
      orderBy: { created_at: "desc" },
    });

    res.json(journals);
  } catch (err) {
    console.error("❌ Fetch journal by user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Endpoint khusus Documentation
app.get("/api/journal_block/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const journals = await prisma.journalEntry.findMany({
      where: { user_id: Number(user_id) },
      include: { user: true, details: true },
      orderBy: { created_at: "desc" },
    });

    res.json(journals);
  } catch (err) {
    console.error("❌ Fetch journal by user error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🚀 Start server
app.listen(5000, () =>
  console.log("✅ Server running with Prisma on http://localhost:5000")
);
