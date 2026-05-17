import { create } from 'zustand'
import { type JinEngine } from '@meetjin/core'

export type JinState = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface JinStore {
  state: JinState
  transcript: string
  response: string
  engine: JinEngine
  model: string
  isEngineReady: boolean

  // Actions
  setState: (state: JinState) => void
  setTranscript: (text: string) => void
  setResponse: (text: string) => void
  setEngine: (engine: JinEngine) => void
  setModel: (model: string) => void
  setEngineReady: (ready: boolean) => void
}

export const useJinStore = create<JinStore>((set) => ({
  state: 'idle',
  transcript: '',
  response: '',
  engine: 'ollama',
  model: 'gemma4:31b-cloud',
  isEngineReady: false,

  setState: (state) => set({ state }),
  setTranscript: (transcript) => set({ transcript }),
  setResponse: (response) => set({ response }),
  setEngine: (engine) => set({ engine }),
  setModel: (model) => set({ model }),
  setEngineReady: (isEngineReady) => set({ isEngineReady }),
}))
