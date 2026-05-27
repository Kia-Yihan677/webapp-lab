import React, { useEffect, useMemo, useRef, useState } from 'react';

const moods = [
  {
    id: 'cemas',
    label: 'Cemas',
    emoji: '😟',
    tone: 'Tubuh siaga, pikiran berlari',
    need: 'Rasa aman',
    practice: 'Tarik napas 4 detik, buang 6 detik. Ulangi 6 putaran sambil menaruh satu tangan di dada.',
    prompt: 'Apa satu hal yang benar-benar sedang terjadi, bukan yang ditakutkan pikiran?',
    affirmation: [
      'Aku aman di momen ini.',
      'Aku tidak perlu menyelesaikan semuanya sekaligus.',
      'Aku boleh bergerak pelan dan tetap bertumbuh.',
    ],
    evidence: 'Slow breathing dapat memengaruhi sistem saraf otonom, termasuk heart rate variability dan keseimbangan simpatis-parasimpatis.',
    source: 'Russo et al., 2017',
  },
  {
    id: 'sedih',
    label: 'Sedih',
    emoji: '😢',
    tone: 'Energi turun, hati terasa berat',
    need: 'Diterima',
    practice: 'Sebutkan perasaanmu dengan kalimat sederhana: "Aku sedang sedih karena ...". Jangan diperindah, cukup jujur.',
    prompt: 'Kalau rasa sedih ini ingin dilindungi, apa yang ia minta darimu hari ini?',
    affirmation: [
      'Aku tidak salah karena merasa sedih.',
      'Perasaanku valid, tapi ia bukan seluruh diriku.',
      'Aku tetap layak disayangi saat sedang rapuh.',
    ],
    evidence: 'Affect labeling dikaitkan dengan peningkatan aktivitas ventrolateral prefrontal cortex dan penurunan respons amygdala.',
    source: 'Lieberman et al., 2007',
  },
  {
    id: 'malu',
    label: 'Malu',
    emoji: '😳',
    tone: 'Ingin menghilang atau menutup diri',
    need: 'Self-compassion',
    practice: 'Tulis satu kalimat yang akan kamu ucapkan ke teman baik jika ia mengalami hal yang sama.',
    prompt: 'Bagian mana yang sebenarnya butuh dipeluk, bukan dihukum?',
    affirmation: [
      'Aku boleh belajar tanpa mempermalukan diriku.',
      'Satu momen buruk tidak mendefinisikan nilai diriku.',
      'Aku memilih lembut, bukan kejam, pada diriku.',
    ],
    evidence: 'Meta-analisis menemukan self-compassion berkaitan dengan distress psikologis yang lebih rendah, termasuk cemas dan depresi.',
    source: 'Marsh et al., 2018',
  },
  {
    id: 'validasi',
    label: 'Butuh validasi',
    emoji: '🥺',
    tone: 'Nilai diri terasa bergantung pada respons orang',
    need: 'Kembali ke diri',
    practice: 'Pilih satu nilai yang kamu mau hidupi hari ini, lalu lakukan satu tindakan kecil untuk nilai itu tanpa menunggu dilihat.',
    prompt: 'Kalau tidak ada yang menilai, versi dirimu yang mana yang tetap ingin kamu bangun?',
    affirmation: [
      'Aku cuma jadi versi yang aku sukai.',
      'Aku boleh bodo amat dengan penilaian yang tidak merawatku.',
      'Aku lebih mengutamakan menjadi versi terbaik diriku dan menyukai diriku.',
      'Semua kulakukan untuk diriku. Aku melindungi ketenangan diriku.',
    ],
    evidence: 'Self-affirmation tentang nilai personal dapat mengaktifkan area reward seperti ventral striatum dalam studi fMRI.',
    source: 'Cascio et al., 2016',
  },
  {
    id: 'marah',
    label: 'Marah',
    emoji: '😠',
    tone: 'Ada batas yang terasa dilanggar',
    need: 'Batas yang jelas',
    practice: 'Tunda respons 90 detik. Catat: "Aku marah karena ...", lalu ubah menjadi permintaan yang spesifik.',
    prompt: 'Batas apa yang perlu dijaga tanpa menyakiti dirimu sendiri?',
    affirmation: [
      'Amarahku memberi sinyal, bukan perintah.',
      'Aku bisa tegas tanpa kehilangan kendali.',
      'Aku berhak punya batas yang sehat.',
    ],
    evidence: 'Memberi nama emosi dan melakukan reappraisal melibatkan area prefrontal yang membantu regulasi respons emosional.',
    source: 'Torre & Lieberman, 2018',
  },
];

const tools = [
  {
    title: 'Name it to tame it',
    tag: 'Affect labeling',
    text: 'Ubah emosi dari kabut menjadi kata: "Aku sedang cemas", "Aku merasa malu". Ini membantu otak berpindah dari reaksi mentah ke pengolahan yang lebih sadar.',
  },
  {
    title: 'Self-affirmation berbasis nilai',
    tag: 'Neural reward',
    text: 'Afirmasi paling kuat saat terhubung dengan nilai yang kamu pilih sendiri, bukan sekadar kalimat manis. Mulai dari "aku ingin menjadi orang yang ...".',
  },
  {
    title: 'Compassionate reframe',
    tag: 'Self-compassion',
    text: 'Ganti nada menghukum dengan nada pelatih yang sayang: tetap jujur soal kesalahan, tapi tidak menjadikan diri sebagai musuh.',
  },
];

const pivotSteps = [
  {
    title: 'Capture',
    subtitle: 'Ambil faktanya',
    text: 'Tulis apa yang benar-benar terjadi, bukan cerita paling keras yang muncul di kepala.',
    prompt: 'Apa faktanya, dan apa interpretasiku?',
  },
  {
    title: 'Adjust',
    subtitle: 'Pilih perbaikan kecil',
    text: 'Ubah pelajaran menjadi satu tindakan yang bisa dilakukan di meeting, chat, atau pekerjaan berikutnya.',
    prompt: 'Satu hal apa yang akan kubuat lebih jelas besok?',
  },
  {
    title: 'Move',
    subtitle: 'Lanjut tanpa menghukum diri',
    text: 'Setelah pelajaran diambil, berhenti mengulang adegan yang sama. Kamu boleh lanjut sambil tetap belajar.',
    prompt: 'Apa langkah berikutnya yang paling ringan?',
  },
];

const workSituations = [
  {
    event: 'Meeting terasa buruk',
    reframe: 'Satu meeting bukan identitas profesionalmu.',
    action: 'Catat 3 poin utama untuk follow-up.',
  },
  {
    event: 'Kritik dari atasan',
    reframe: 'Kritik adalah data, bukan vonis nilai diri.',
    action: 'Minta contoh output yang dianggap jelas.',
  },
  {
    event: 'Kepikiran omongan orang',
    reframe: 'Tidak semua komentar perlu menjadi pusat harimu.',
    action: 'Tentukan apakah ada pelajaran, batas, atau cukup dilepas.',
  },
];

const navigationSignals = [
  'Ada orang yang direct, defensif, suportif, atau suka melempar tanggung jawab.',
  'Tugasmu bukan membuat semua orang menyenangkan, tapi membaca pola dan menyesuaikan cara komunikasi.',
  'Adaptasi profesional bukan berarti palsu. Itu cara menjaga energi sambil tetap bergerak.',
];

const sources = [
  {
    label: 'Lieberman et al., Psychological Science, 2007',
    href: 'https://pubmed.ncbi.nlm.nih.gov/17576282/',
  },
  {
    label: 'Cascio et al., Social Cognitive and Affective Neuroscience, 2016',
    href: 'https://pubmed.ncbi.nlm.nih.gov/26917214/',
  },
  {
    label: 'Russo et al., Breathe, 2017',
    href: 'https://pubmed.ncbi.nlm.nih.gov/29209423/',
  },
  {
    label: 'Marsh et al., Mindfulness, 2018',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6061226/',
  },
  {
    label: 'Torre & Lieberman, Emotion Review, 2018',
    href: 'https://journals.sagepub.com/doi/10.1177/1754073917742706',
  },
];

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getOffset(index, selectedIndex, total) {
  const rawOffset = index - selectedIndex;
  const wrappedOffset =
    Math.abs(rawOffset) > total / 2
      ? rawOffset - Math.sign(rawOffset) * total
      : rawOffset;

  return wrappedOffset;
}

function getOrbitStyle(offset) {
  const orbitMap = {
    '-2': { x: -76, y: 104, scale: 0.84, opacity: 0.64, z: 1 },
    '-1': { x: -108, y: -20, scale: 0.94, opacity: 0.84, z: 2 },
    0: { x: 0, y: -132, scale: 1.08, opacity: 1, z: 4 },
    1: { x: 108, y: -20, scale: 0.94, opacity: 0.84, z: 2 },
    2: { x: 76, y: 104, scale: 0.84, opacity: 0.64, z: 1 },
  };
  const orbit = orbitMap[offset] ?? orbitMap[0];

  return {
    '--x': `${orbit.x}px`,
    '--y': `${orbit.y}px`,
    '--scale': orbit.scale,
    '--opacity': orbit.opacity,
    '--z': orbit.z,
  };
}

export default function App() {
  const [selectedMood, setSelectedMood] = useState(moods[0].id);
  const [isRevealed, setIsRevealed] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [aiReflection, setAiReflection] = useState(null);
  const [aiError, setAiError] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const guidanceRef = useRef(null);
  const selectedIndex = moods.findIndex((item) => item.id === selectedMood);
  const mood = useMemo(
    () => moods.find((item) => item.id === selectedMood) ?? moods[0],
    [selectedMood],
  );

  const selectMoodByIndex = (nextIndex) => {
    const safeIndex = (nextIndex + moods.length) % moods.length;
    setSelectedMood(moods[safeIndex].id);
    setIsRevealed(false);
  };

  const goPrevious = () => selectMoodByIndex(selectedIndex - 1);
  const goNext = () => selectMoodByIndex(selectedIndex + 1);
  const revealGuidance = () => {
    setIsRevealed(true);
    window.setTimeout(() => {
      guidanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  const requestAiReflection = async (event) => {
    event.preventDefault();

    if (!journalText.trim()) {
      setAiError('Tulis sedikit ceritamu dulu.');
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiReflection(null);
    setIsRevealed(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/reflection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: mood.label,
          note: journalText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'AI belum bisa membuat refleksi.');
      }

      setAiReflection(data.reflection);
      window.setTimeout(() => {
        guidanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 160);
    } catch (error) {
      setAiError(error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (isRevealed) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSelectedMood((currentMood) => {
        const currentIndex = moods.findIndex((item) => item.id === currentMood);
        const nextIndex = (currentIndex + 1) % moods.length;
        return moods[nextIndex].id;
      });
    }, 3200);

    return () => window.clearInterval(timer);
  }, [isRevealed]);

  return (
    <main className={isRevealed ? 'app-shell is-revealed' : 'app-shell'}>
      <section className="today-panel" aria-labelledby="dashboard-title">
        <div className="title-block">
          <p className="eyebrow">Tumbuh hari ini</p>
          <h1 id="dashboard-title">Apa yang sedang kamu rasakan?</h1>
          <p className="lead">
            Pilih rasa yang paling dekat. Aplikasi ini akan bantu kamu menamai,
            menenangkan tubuh, lalu memilih satu tindakan kecil yang berpihak
            pada dirimu.
          </p>
        </div>

        <div className="mood-stage" aria-label="Pilihan perasaan">
          <div className="character-wrap" aria-hidden="true">
            <div className="character">
              <span className="character-face">
                <span className="eye left-eye" />
                <span className="eye right-eye" />
                <span className="smile" />
              </span>
              <span className="character-body" />
            </div>
          </div>

          <div className="mood-orbit">
            {moods.map((item, index) => {
              const offset = getOffset(index, selectedIndex, moods.length);

              return (
                <button
                  aria-label={`Pilih perasaan ${item.label}`}
                  className={item.id === selectedMood ? 'orbit-mood is-active' : 'orbit-mood'}
                  key={item.id}
                  onClick={() => {
                    setSelectedMood(item.id);
                    setIsRevealed(false);
                  }}
                  style={getOrbitStyle(offset)}
                  type="button"
                >
                  <span className="mood-emoji">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="stage-controls">
            <button
              aria-label="Pilih perasaan sebelumnya"
              className="arrow-button"
              onClick={goPrevious}
              type="button"
            >
              ‹
            </button>
            <div className="selected-mood">
              <span>{mood.emoji}</span>
              <strong>{mood.label}</strong>
              <small>{mood.need}</small>
            </div>
            <button
              aria-label="Pilih perasaan berikutnya"
              className="arrow-button"
              onClick={goNext}
              type="button"
            >
              ›
            </button>
          </div>

          <button
            className="feeling-button"
            onClick={revealGuidance}
            type="button"
          >
            Aku sedang merasakan {mood.label.toLowerCase()}
          </button>
        </div>
      </section>

      <section className="journal-section" aria-labelledby="journal-title">
        <div className="journal-copy">
          <p className="eyebrow">AI companion</p>
          <h2 id="journal-title">Ceritakan sedikit yang terjadi hari ini</h2>
          <p>
            AI akan membaca mood yang kamu pilih dan ceritamu, lalu memberi
            validasi emosi, sisi positif, latihan singkat, afirmasi, dan satu
            langkah kecil yang bisa kamu lakukan.
          </p>
        </div>

        <form className="journal-form" onSubmit={requestAiReflection}>
          <label htmlFor="journal-entry">Catatan hari ini</label>
          <textarea
            id="journal-entry"
            onChange={(event) => setJournalText(event.target.value)}
            placeholder="Contoh: hari ini aku malu jawab pertanyaan salah di depan kelas..."
            rows="7"
            value={journalText}
          />
          {aiError ? <p className="form-error">{aiError}</p> : null}
          <button disabled={isAiLoading} type="submit">
            {isAiLoading ? 'Menenangkan pikiran...' : 'Minta refleksi AI'}
          </button>
        </form>
      </section>

      <section
        className="reflection-grid"
        aria-label={`Panduan untuk rasa ${mood.label}`}
        ref={guidanceRef}
      >
        <article className="focus-card">
          <div>
            <p className="eyebrow">Saat ini</p>
            <h2>{mood.label}</h2>
            <p className="mood-tone">{mood.tone}</p>
          </div>
          <div className="practice-box">
            <span>Latihan 2 menit</span>
            <p>{mood.practice}</p>
          </div>
          <div className="prompt-line">
            <span>Pertanyaan jujur</span>
            <strong>{mood.prompt}</strong>
          </div>
        </article>

        <article className="affirmation-card">
          <p className="eyebrow">Kalimat jangkar</p>
          <div className="affirmation-list">
            {mood.affirmation.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </article>

        <article className="science-card">
          <p className="eyebrow">Dasar ilmiah</p>
          <p>{mood.evidence}</p>
          <span>{mood.source}</span>
        </article>
      </section>

      {aiReflection ? (
        <section className="ai-result-section" aria-label="Hasil refleksi AI">
          <article className="ai-result-main">
            <p className="eyebrow">Refleksi AI</p>
            <h2>{aiReflection.validation}</h2>
            <p>{aiReflection.positive_reframe}</p>
          </article>
          <div className="ai-result-grid">
            <article>
              <span>Latihan sekarang</span>
              <p>{aiReflection.practice}</p>
            </article>
            <article>
              <span>Langkah kecil</span>
              <p>{aiReflection.small_step}</p>
            </article>
            <article>
              <span>Afirmasi</span>
              <p>{aiReflection.affirmation}</p>
            </article>
            <article>
              <span>Journaling lanjut</span>
              <p>{aiReflection.journal_prompt}</p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="tool-section" aria-labelledby="tool-title">
        <div className="section-heading">
          <p className="eyebrow">Teknik inti</p>
          <h2 id="tool-title">Pola bantuan yang bisa dipakai berulang</h2>
        </div>
        <div className="tool-grid">
          {tools.map((tool) => (
            <article className="tool-card" key={tool.title}>
              <span>{tool.tag}</span>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="work-pivot-section" aria-labelledby="pivot-title">
        <div className="pivot-intro">
          <p className="eyebrow">Dunia kerja</p>
          <h2 id="pivot-title">Pivot cepat setelah hari yang berat</h2>
          <p>
            Skill pentingnya bukan tidak pernah sakit hati, salah bicara, atau
            pulang dengan kepala penuh. Skill-nya adalah tidak tinggal terlalu
            lama di satu kejadian. Ambil pelajaran, atur ulang respons, lalu
            kembali bergerak tanpa menjadikan momen itu sebagai identitas.
          </p>
        </div>

        <div className="pivot-flow" aria-label="Langkah Capture Adjust Move">
          {pivotSteps.map((step, index) => (
            <article className="pivot-step" key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <strong>{step.subtitle}</strong>
              <p>{step.text}</p>
              <em>{step.prompt}</em>
            </article>
          ))}
        </div>

        <div className="work-grid">
          <article className="reset-card">
            <p className="eyebrow">Reset 20 menit</p>
            <h3>Batasi replay di kepala</h3>
            <p>
              Beri otak slot untuk memproses, lalu tutup dengan keputusan kecil.
              Kalau pikiran kembali memutar ulang percakapan, ingatkan diri:
              "Sudah diproses. Sekarang lanjut."
            </p>
            <div className="reset-table">
              {workSituations.map((item) => (
                <div className="reset-row" key={item.event}>
                  <span>{item.event}</span>
                  <p>{item.reframe}</p>
                  <strong>{item.action}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="navigation-card">
            <p className="eyebrow">Social awareness</p>
            <h3>Belajar orang apa adanya</h3>
            <ul>
              {navigationSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="sources-strip" aria-label="Referensi ilmiah">
        <span>Referensi awal</span>
        <div>
          {sources.map((source) => (
            <a href={source.href} key={source.href} rel="noreferrer" target="_blank">
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
