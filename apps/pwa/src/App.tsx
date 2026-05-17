import { JinOrb } from './components/JinOrb'

function App() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <div className="w-full h-full p-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-zinc-100 mb-8 tracking-tighter">MeetJin</h1>
        <JinOrb />
      </div>
    </main>
  )
}

export default App
