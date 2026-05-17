import { useEffect, useRef, useCallback } from 'react'
import { useJinStore } from './store'
import { AgentRunner } from '@meetjin/core'

// Declare types for Web Speech API since they might not be in standard DOM types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useJin() {
  const { 
    state, 
    setState, 
    transcript, 
    setTranscript, 
    response, 
    setResponse,
    model,
    setModel
  } = useJinStore()
  
  const recognitionRef = useRef<any>(null)
  const agentRunnerRef = useRef<AgentRunner | null>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US' // Can be configured later
      
      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          setState('thinking')
          processInput(finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setState('idle')
      }

      recognition.onend = () => {
        if (useJinStore.getState().state === 'listening') {
          // If it ended prematurely while still supposed to listen, we might restart or go idle
          // setState('idle') // for now let it be handled by processInput
        }
      }

      recognitionRef.current = recognition
    }

    // Init agent runner
    agentRunnerRef.current = new AgentRunner(model)
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [setState, setTranscript, model])

  const processInput = async (text: string) => {
    if (!agentRunnerRef.current) return

    try {
      // Send to LLM
      const reply = await agentRunnerRef.current.run(text)
      setResponse(reply)
      setState('speaking')
      speakResponse(reply)
    } catch (error) {
      console.error('Agent error:', error)
      setResponse('Sorry, I encountered an error.')
      setState('speaking')
      speakResponse('Sorry, I encountered an error.')
    }
  }

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) {
      setState('idle')
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => {
      setState('idle')
      setTranscript('')
    }
    utterance.onerror = () => {
      setState('idle')
    }

    window.speechSynthesis.speak(utterance)
  }

  const startListening = useCallback(() => {
    if (state !== 'idle') return
    
    setState('listening')
    setTranscript('')
    setResponse('')
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Handle case where recognition is already started
        console.error('Recognition start error:', e)
        setState('idle')
      }
    } else {
      console.warn('Speech recognition not supported')
      setState('idle')
    }
  }, [state, setState, setTranscript, setResponse])

  const stopListening = useCallback(() => {
    if (state === 'listening' && recognitionRef.current) {
      recognitionRef.current.stop()
      setState('thinking')
    }
  }, [state, setState])

  const interrupt = useCallback(() => {
    if (state === 'speaking') {
      window.speechSynthesis?.cancel()
      setState('idle')
    } else if (state === 'listening') {
      recognitionRef.current?.abort()
      setState('idle')
    }
  }, [state, setState])

  return {
    state,
    transcript,
    response,
    model,
    setModel,
    startListening,
    stopListening,
    interrupt,
    sendText: processInput
  }
}
