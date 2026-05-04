import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import dscLogo from './assets/dsc_logo.png';
import stampDsc from './assets/stamp_dsc.png';

type Phase = 'form' | 'inserting' | 'closing' | 'stamping' | 'flying' | 'arrived';

function App() {
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'submit' | 'past' | 'collection'>('submit');
  const [posts, setPosts] = useState<any[]>([]);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [submittedText, setSubmittedText] = useState('');
  const [mockMode, setMockMode] = useState(true);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setSubmittedText(text);
    setPhase('inserting');

    const apiPromise = mockMode
      ? wait(300).then(() => ({
          id: `mock_${Date.now()}`,
          text,
          rank: pickRandom(['S', 'A', 'B', 'C', 'D']),
          score: Math.floor(Math.random() * 101),
          reason: 'モックデータ：APIを呼ばずに動作確認しています。',
          createdAt: new Date().toISOString(),
        }))
      : fetch('http://localhost:3001/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }).then((r) => r.json());

    await wait(1400);
    setPhase('closing');
    await wait(900);
    setPhase('stamping');
    await wait(750);
    setPhase('flying');
    await wait(1300);

    const result = await apiPromise;
    setEvaluation(result);
    setPhase('arrived');
    setText('');
  };

  const handleReset = () => {
    setEvaluation(null);
    setPhase('form');
  };

  useEffect(() => {
    if (tab === 'past') {
      fetch('http://localhost:3001/api/posts')
        .then((res) => res.json())
        .then((data) => setPosts(data));
    }
  }, [tab]);

  return (
    <div
      className="min-h-screen text-emerald-900"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${dscLogo})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '120px',
      }}
    >
      {/* ヘッダーバー */}
      <header className="bg-emerald-700 text-white px-6 py-3 shadow-md flex items-center">
        <h1 className="font-jp-bold text-3xl tracking-wider drop-shadow-sm whitespace-nowrap">
          のがにゃんを唸らせろ！！！！
        </h1>

        <nav className="flex-1 flex gap-2 justify-center">
          <HeaderTab active={tab === 'submit'} onClick={() => setTab('submit')}>
            投稿
          </HeaderTab>
          <HeaderTab active={tab === 'past'} onClick={() => setTab('past')}>
            過去のアイデア
          </HeaderTab>
          <HeaderTab
            active={tab === 'collection'}
            onClick={() => setTab('collection')}
          >
            コレクション
          </HeaderTab>
        </nav>

        <label className="text-xs flex items-center gap-1 whitespace-nowrap">
          <input
            type="checkbox"
            checked={mockMode}
            onChange={(e) => setMockMode(e.target.checked)}
          />
          テストモード
        </label>
      </header>

      <main className="p-4">
      {tab === 'submit' && (
        <SubmitTab
          text={text}
          setText={setText}
          phase={phase}
          submittedText={submittedText}
          evaluation={evaluation}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      )}

      {tab === 'past' && <PastTab posts={posts} />}

      {tab === 'collection' && (
        <div className="text-center text-emerald-700 py-12">
          コレクションページは準備中です。
        </div>
      )}
      </main>
    </div>
  );
}

function PastTab({ posts }: { posts: any[] }) {
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      {posts.length === 0 ? (
        <div className="text-center text-emerald-700 py-8">
          まだ投稿がありません
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {posts
            .slice()
            .reverse()
            .map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              >
                <SealedEnvelope />
                <p className="text-xs text-emerald-700">
                  {formatDate(post.createdAt)}
                </p>
              </button>
            ))}
        </div>
      )}

      <AnimatePresence>
        {selectedPost && (
          <PostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SealedEnvelope() {
  return (
    <div
      className="relative w-full bg-amber-50 border-2 border-amber-300 rounded-sm shadow-md"
      style={{ aspectRatio: '2.1 / 1.1' }}
    >
      {/* 3 つの前面三角 */}
      <div
        className="absolute inset-0 bg-amber-100"
        style={{ clipPath: 'polygon(0% 100%, 100% 100%, 50% 50%)' }}
      />
      <div
        className="absolute inset-0 bg-amber-100"
        style={{ clipPath: 'polygon(0% 0%, 0% 100%, 50% 50%)' }}
      />
      <div
        className="absolute inset-0 bg-amber-100"
        style={{ clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)' }}
      />
      {/* 閉じた上フタ */}
      <div
        className="absolute inset-0 bg-amber-200 border-amber-400"
        style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%)' }}
      />
      {/* 中央のハンコ */}
      <img
        src={stampDsc}
        alt="DSCスタンプ"
        className="absolute"
        style={{
          width: '22%',
          aspectRatio: '1',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

function PostModal({ post, onClose }: { post: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-emerald-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl"
      >
        <div className="mb-5">
          <h3 className="font-bold text-emerald-800 text-lg mb-2 border-b border-emerald-300 pb-1">
            あなたのアイデア
          </h3>
          <p className="text-emerald-900 whitespace-pre-wrap break-words leading-relaxed">
            {post.text || '（内容なし）'}
          </p>
        </div>

        <div className="mb-5">
          <h3 className="font-bold text-emerald-800 text-lg mb-2 border-b border-emerald-300 pb-1">
            のがにゃんのコメント（ランク {post.rank}）
          </h3>
          <p className="text-emerald-900 whitespace-pre-wrap break-words leading-relaxed">
            {post.reason}
          </p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-emerald-600">
            {formatDate(post.createdAt)}
          </p>
          <button
            onClick={onClose}
            className="font-bold px-4 py-1 bg-emerald-700 text-white rounded hover:bg-emerald-800"
          >
            閉じる
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function HeaderTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'px-4 py-1 bg-white text-emerald-800 rounded font-bold shadow'
          : 'px-4 py-1 text-white border border-white/60 rounded hover:bg-emerald-800'
      }
    >
      {children}
    </button>
  );
}

function SubmitTab({
  text,
  setText,
  phase,
  submittedText,
  evaluation,
  onSubmit,
  onReset,
}: {
  text: string;
  setText: (s: string) => void;
  phase: Phase;
  submittedText: string;
  evaluation: any | null;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const isArrived = phase === 'arrived' && evaluation !== null;

  return (
    <AnimatePresence mode="wait">
      {isArrived ? (
        <motion.div
          key="arrived-scene"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center min-h-[80vh]"
        >
          <div className="flex-1 flex items-start justify-center gap-8 lg:gap-16 w-full px-8 max-w-6xl py-8">
            {/* 左：メッセージ */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border-2 border-emerald-700 p-6 rounded shadow-lg max-w-sm flex-1 max-h-[70vh] overflow-y-auto"
            >
              <h2 className="font-bold text-emerald-800 mb-3 text-lg border-b border-emerald-300 pb-2 sticky top-0 bg-white">
                あなたのアイデア
              </h2>
              <p className="text-emerald-900 leading-relaxed whitespace-pre-wrap break-words">
                {submittedText}
              </p>
            </motion.div>

            {/* 右：顧問＋吹き出し */}
            <div className="flex flex-col items-center">
              {/* 吹き出し（顧問の上） */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white border-2 border-emerald-700 p-4 rounded-2xl shadow w-72 mb-3 relative"
              >
                <p className="font-bold text-emerald-800 mb-1">
                  ランク: {evaluation.rank}
                </p>
                <p className="text-sm text-emerald-900 break-words whitespace-pre-wrap">
                  {evaluation.reason}
                </p>
                {/* 吹き出しの三角（外側の枠） */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    bottom: -14,
                    borderLeft: '14px solid transparent',
                    borderRight: '14px solid transparent',
                    borderTop: '14px solid #047857',
                  }}
                />
                {/* 吹き出しの三角（内側の白） */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    bottom: -10,
                    borderLeft: '11px solid transparent',
                    borderRight: '11px solid transparent',
                    borderTop: '11px solid white',
                  }}
                />
              </motion.div>

              {/* 顧問 */}
              <motion.img
                src="/src/assets/advisor.png"
                alt="顧問"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-48"
              />
            </div>
          </div>

          {/* 戻るボタン */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onReset}
            className="font-bold underline text-emerald-700 mb-8"
          >
            もう一度投稿
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          key="normal-scene"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center min-h-[80vh] relative"
        >
          {/* 顧問エリア（常時中央） */}
          <div className="flex-1 flex items-center justify-center w-full pt-8 pb-4">
            <div className="relative inline-block">
              <img src="/src/assets/advisor.png" alt="顧問" className="w-48" />
            </div>
          </div>

          {/* フォーム / アニメーション エリア */}
          <div className="w-full max-w-2xl pb-8 min-h-[280px] relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              {phase === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="w-full bg-white border-2 border-emerald-700 shadow-md rounded-sm p-4">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="のがにゃんに伝えるアイデアを書いてね..."
                      maxLength={300}
                      className="w-full h-32 p-2 outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={onSubmit}
                    disabled={!text.trim()}
                    className="font-bold px-8 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded shadow disabled:opacity-50"
                  >
                    送信する
                  </button>
                </motion.div>
              )}

              {(phase === 'inserting' ||
                phase === 'closing' ||
                phase === 'stamping' ||
                phase === 'flying') && (
                <motion.div
                  key="envelope-wrapper"
                  initial={{ opacity: 0, y: 0, scale: 1 }}
                  animate={
                    phase === 'flying'
                      ? {
                          y: [0, -20, -360],
                          scale: [1, 1, 0.12],
                          opacity: [1, 1, 0],
                        }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  transition={
                    phase === 'flying'
                      ? { duration: 1.3, times: [0, 0.2, 1], ease: 'easeOut' }
                      : { duration: 0.45 }
                  }
                >
                  <Envelope phase={phase} text={submittedText} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Envelope({ phase, text }: { phase: Phase; text: string }) {
  const flapClosed =
    phase === 'closing' || phase === 'stamping' || phase === 'flying';
  const showStamp = phase === 'stamping' || phase === 'flying';

  return (
    <div
      className="relative w-[420px] h-[220px]"
      style={{ perspective: 1000, marginTop: 130 }}
    >
      {/* 1. 封筒の背面（土台） z-10 */}
      <div
        className="envelope-back absolute inset-0 bg-amber-50 border-2 border-amber-300 rounded-sm shadow-md"
        style={{ zIndex: 10 }}
      />

      {/* 2. 便箋 z-20（封筒の中に滑り込む） */}
      <motion.div
        className="letter absolute bg-white border shadow-sm rounded-sm p-2 leading-snug overflow-hidden break-all"
        initial={{ y: -180 }}
        animate={{ y: 30 }}
        transition={{ duration: 1.3, delay: 0.2, ease: 'easeOut' }}
        style={{
          left: 20,
          right: 20,
          top: 0,
          height: 170,
          zIndex: 20,
          fontSize: text.length > 120 ? '10px' : text.length > 60 ? '12px' : '14px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </motion.div>

      {/* 3-5. 封筒の前面（左・右・下の3つの三角形） z-30 */}
      <div
        className="envelope-pocket-bottom absolute inset-0 bg-amber-100"
        style={{
          clipPath: 'polygon(0% 100%, 100% 100%, 50% 50%)',
          zIndex: 30,
        }}
      />
      <div
        className="envelope-pocket-left absolute inset-0 bg-amber-100"
        style={{
          clipPath: 'polygon(0% 0%, 0% 100%, 50% 50%)',
          zIndex: 30,
        }}
      />
      <div
        className="envelope-pocket-right absolute inset-0 bg-amber-100"
        style={{
          clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)',
          zIndex: 30,
        }}
      />

      {/* 6. 上フタ（rotateX で 180→0 に倒れる）
            開いた状態（rotateX:180）は便箋より後ろ（z-1）、
            閉じた状態（rotateX:0）は前面（z-40）に切り替え */}
      <motion.div
        className="envelope-top-flap absolute inset-0 bg-amber-200 border-2 border-amber-400"
        initial={{ rotateX: 180 }}
        animate={{ rotateX: flapClosed ? 0 : 180 }}
        transition={{ type: 'spring', duration: 0.9, bounce: 0.45 }}
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%)',
          transformOrigin: 'top',
          zIndex: flapClosed ? 40 : 1,
        }}
      />

      {/* ハンコ：閉じたフタの中央にポンッと押される z-50 */}
      <AnimatePresence>
        {showStamp && (
          <motion.img
            src={stampDsc}
            alt="DSCスタンプ"
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: [0, 1.4, 1], rotate: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute w-14 h-14"
            style={{
              top: 83,
              left: '50%',
              marginLeft: -28,
              zIndex: 50,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export default App;
