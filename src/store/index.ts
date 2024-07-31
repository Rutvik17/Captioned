import { create } from "zustand";

type Store = {
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
        }) => void
    reset: () => void
}
  
const useCaptionedStore = create<Store>()((set) => ({
    media: {path: '', type: '', captions: []},
    updateMedia: ({path, type, captions}) => set((state) => ({ media: {path, type, captions} })),
    reset: () => set({ media: {path: '', type: '', captions: []} })
}))

export default useCaptionedStore;

