import { useJin } from '@meetjin/sdk'
import { motion, type Variants } from 'framer-motion'

const orbVariants: Variants = {
    idle: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 4,
            ease: 'easeInOut',
            repeat: Infinity,
        },
    },
    listening: {
        scale: [1, 1.15, 1],
        filter: [
            'drop-shadow(0 0 0px rgba(168, 85, 247, 0))',
            'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))',
            'drop-shadow(0 0 0px rgba(168, 85, 247, 0))',
        ],
        transition: {
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
        },
    },
    thinking: {
        scale: 1,
        rotate: [0, 360],
        transition: {
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
        },
    },
    speaking: {
        scale: [1, 1.1, 1.05, 1.15, 1],
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
            repeat: Infinity,
        },
    },
}

export function JinOrb() {
    const { state, transcript, response, model, setModel, startListening, interrupt, sendText } = useJin()

    const handlePress = () => {
        if (state === 'idle') {
            startListening()
        } else {
            interrupt()
        }
    }

    // Auto-scroll logic or simple UI updates can be added if needed

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-md mx-auto p-6 space-y-12">
            
            {/* Model Selector */}
            <div className="flex space-x-2 bg-zinc-900 border border-zinc-800 p-1 rounded-full text-xs">
                <button
                    onClick={() => setModel('gemma4:31b-cloud')}
                    className={`px-3 py-1.5 rounded-full transition-colors ${model === 'gemma4:31b-cloud' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Gemma 4
                </button>
                <button
                    onClick={() => setModel('glm-5.1:cloud')}
                    className={`px-3 py-1.5 rounded-full transition-colors ${model === 'glm-5.1:cloud' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    GLM 5.1
                </button>
            </div>

            {/* The Orb */}
            <div className="relative flex items-center justify-center h-48 w-48">
                <motion.img
                    src="/orb.png"
                    alt="Jin Orb"
                    className="absolute inset-0 w-full h-full object-contain cursor-pointer drop-shadow-xl"
                    variants={orbVariants}
                    animate={state}
                    onClick={handlePress}
                    whileHover={{ scale: state === 'idle' ? 1.05 : undefined }}
                    whileTap={{ scale: 0.95 }}
                />
            </div>

            {/* Status and Transcript */}
            <div className="flex flex-col items-center text-center space-y-4 min-h-32 w-full">
                <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
                    {state}
                </span>

                {transcript && state !== 'idle' && (
                    <p className="text-xl text-zinc-300 italic">"{transcript}"</p>
                )}

                {response && state === 'speaking' && (
                    <p className="text-lg text-zinc-100">{response}</p>
                )}
                
                {state === 'idle' && !response && !transcript && (
                    <p className="text-zinc-500">Tap the orb to speak</p>
                )}

                {/* Text Fallback Input */}
                <form 
                    className="w-full mt-8 flex space-x-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        const form = e.target as HTMLFormElement
                        const input = form.elements.namedItem('textInput') as HTMLInputElement
                        if (input.value.trim() && state === 'idle') {
                            sendText(input.value.trim())
                            input.value = ''
                        }
                    }}
                >
                    <input 
                        type="text" 
                        name="textInput" 
                        placeholder="Or type here..." 
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                        disabled={state !== 'idle'}
                    />
                    <button 
                        type="submit"
                        disabled={state !== 'idle'}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
}