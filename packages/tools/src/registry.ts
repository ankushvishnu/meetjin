export interface Tool {
    name: string
    description: string
    parameters: any
    execute: (args: any) => Promise<any>
}

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map()

    register(tool: Tool) {
        this.tools.set(tool.name, tool)
    }

    getTool(name: string): Tool | undefined {
        return this.tools.get(name)
    }

    getAllTools(): Tool[] {
        return Array.from(this.tools.values())
    }

    async executeTool(name: string, args: any): Promise<any> {
        const tool = this.getTool(name)
        if (!tool) {
            throw new Error(`Tool not found: ${name}`)
        }
        return await tool.execute(args)
    }
}
