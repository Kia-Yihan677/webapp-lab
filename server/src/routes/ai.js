import { Router } from 'express';

const router = Router();

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5.4-mini';

const systemPrompt = `
Kamu adalah companion refleksi emosi berbahasa Indonesia untuk aplikasi journaling.
Tugasmu membantu pengguna memahami perasaan, bukan menggantikan psikolog atau dokter.

Gaya jawaban:
- Hangat, lembut, dan tidak menghakimi.
- Bahasa Indonesia natural, seperti teman yang dewasa dan suportif.
- Validasi emosi dulu, lalu bantu pengguna melihat sisi yang lebih adil.
- Jangan meremehkan masalah pengguna.
- Jangan membuat diagnosis medis.
- Jika pengguna menyebut ingin menyakiti diri atau tidak aman, sarankan segera menghubungi orang tepercaya atau layanan darurat setempat.

Balas hanya JSON valid dengan bentuk:
{
  "validation": "validasi emosi singkat",
  "positive_reframe": "cara melihat sisi yang lebih sehat",
  "practice": "latihan singkat yang bisa dilakukan sekarang",
  "small_step": "satu langkah kecil yang konkret",
  "affirmation": "satu afirmasi personal",
  "journal_prompt": "satu pertanyaan journaling lanjutan"
}
`;

function getOutputText(responseData) {
  if (typeof responseData.output_text === 'string') {
    return responseData.output_text;
  }

  const textParts = responseData.output
    ?.flatMap((item) => item.content ?? [])
    ?.filter((content) => content.type === 'output_text' && content.text)
    ?.map((content) => content.text);

  return textParts?.join('\n') ?? '';
}

function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Respons AI tidak berbentuk JSON.');
    }

    return JSON.parse(jsonMatch[0]);
  }
}

router.post('/reflection', async (req, res) => {
  const { mood, note } = req.body;

  if (!mood || !note?.trim()) {
    return res.status(400).json({
      error: 'Mood dan cerita singkat wajib diisi.',
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY belum tersedia di server/.env.',
    });
  }

  try {
    const aiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
        input: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Mood yang dipilih: ${mood}\nCerita pengguna: ${note.trim()}`,
          },
        ],
      }),
    });

    const responseData = await aiResponse.json();

    if (!aiResponse.ok) {
      return res.status(aiResponse.status).json({
        error: responseData.error?.message ?? 'Gagal menghubungi layanan AI.',
      });
    }

    const reflection = parseJsonResponse(getOutputText(responseData));

    return res.json({ reflection });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Terjadi kendala saat membuat refleksi AI.',
    });
  }
});

export default router;
