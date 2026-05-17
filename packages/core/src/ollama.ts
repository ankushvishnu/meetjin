import { type JinMessage } from './index'

export class OllamaDriver {
    private baseUrl: string
    private model: string

    constructor(baseUrl: string = '', model: string = 'gemma4:31b-cloud') {
        this.baseUrl = baseUrl
        this.model = model
    }

    async chat(messages: JinMessage[]): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false,
                }),
            })

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`)
            }

            const data = await response.json()
            return data.message.content
        } catch (error) {
            console.error('Ollama communication error:', error)
            throw error
        }
    }
}
