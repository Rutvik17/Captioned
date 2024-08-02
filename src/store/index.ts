import { create } from "zustand";

type Store = {
    stack: 'onboarding' | 'root',
    media: {
        path: string,
        type: 'photo' | 'video' | '',
        captions: {type: string, caption: string}[]
    },
    updateMedia: (
        {path, type, captions} : 
        {
            path: string, 
            type: 'photo' | 'video', 
            captions: {type: string, caption: string}[]
        }) => void,
    updateStack: ({ stack }:{ stack: 'onboarding' | 'root' }) => void,
    reset: () => void
}
  
const useCaptionedStore = create<Store>()((set) => ({
    stack: 'onboarding',
    media: {path: '', type: '', captions: []},
    updateMedia: ({path, type, captions}) => set((state) => ({ media: {path, type, captions} })),
    updateStack: ({stack}) => set(() => ({stack})),
    reset: () => set({ media: {path: '', type: '', captions: []} })
}))

export default useCaptionedStore;

