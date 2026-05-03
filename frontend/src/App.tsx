import { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'submit' | 'past'>('submit');
  const [posts, setPosts] = useState<any[]>([]);

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:3001/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const result = await response.json();
    console.log('結果:', result);
  };
  useEffect(() => {
  if (tab === 'past') {
    fetch('http://localhost:3001/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }
}, [tab]);


  return (
    <div>
      <h1 className="text-red-500 text-3xl font-bold">🎈 DS部 アイデアボックス 🎈</h1>

      <div className="flex gap-2 mb-4">
  <button
    onClick={() => setTab('submit')}
    className={tab === 'submit' ? 'font-bold underline' : ''}
  >
    投稿
  </button>
  <button
    onClick={() => setTab('past')}
    className={tab === 'past' ? 'font-bold underline' : ''}
  >
    過去のアイデア
  </button>
</div>


      {tab === 'submit' && (
  <>
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="あなたのアイデアを書いてね..."
      maxLength={300}
    />
    <button onClick={handleSubmit}>送信する 🚀</button>
  </>
)}

{tab === 'past' && (
  <div className="space-y-4">
    {posts.map((post) => (
      <div key={post.id} className="border p-4 rounded">
        <p className="font-bold">ランク: {post.rank}（スコア: {post.score}）</p>
        <p>{post.text}</p>
        <p className="text-sm text-gray-600">理由: {post.reason}</p>
        <p className="text-xs text-gray-400">{post.createdAt}</p>
      </div>
    ))}
  </div>
)}

</div>
  );
}

export default App;
