import { create } from "zustand";

type Store = {
    media: {
        path: string,
        type: 'photo' | 'video' | ''
    },
    updateMedia: ({path, type} : {path: string, type: 'photo' | 'video'}) => void
}
  
const useCaptionedStore = create<Store>()((set) => ({
    media: {path: '', type: ''},
    updateMedia: ({path, type}) => set((state) => ({ media: {path, type} })),
}))

export default useCaptionedStore;

