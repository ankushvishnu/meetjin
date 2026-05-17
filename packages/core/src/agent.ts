import { OllamaDriver } from './ollama'
import { type JinMessage } from './index'
import { JIN_SYSTEM_PROMPT } from './prompt'

export class AgentRunner {
    private driver: OllamaDriver
    private history: JinMessage[]

    constructor(model: string = 'gemma4:31b-cloud') {
        this.driver = new OllamaDriver('', model)
        this.history = []
    }

    async run(userInput: string): Promise<string> {
        // Add user input to history
        this.history.push({ role: 'user', content: userInput })

        // Build messages payload
        const messages: JinMessage[] = [
            { role: 'system', content: JIN_SYSTEM_PROMPT },
            ...this.history
        ]

        try {
            // Send to Ollama
            const response = await this.driver.chat(messages)
            
            // Add assistant response to history
            this.history.push({ role: 'assistant', content: response })
            
            return response
        } catch (error) {
            console.error('AgentRunner error:', error)
            throw error
        }
    }

    clearHistory() {
        this.history = []
    }
}
