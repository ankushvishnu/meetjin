export type JinEngine = 'ollama' | 'webllm' | 'gemini'

export interface JinMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface JinConfig {
    engine: JinEngine
    model: string
    systemPrompt: string
}

export async function detectEngine(): Promise<JinEngine> {
    // Try Ollama first (desktop)
    try {
        const res = await fetch('http://localhost:11434/api/tags')
        if (res.ok) return 'ollama'
    } catch { }

    // Check WebGPU availability (mobile)
    if ('gpu' in navigator) return 'webllm'

    // Fallback
    return 'gemini'
}

export * from './ollama'
export * from './agent'
export * from './prompt'