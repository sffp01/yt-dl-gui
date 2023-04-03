import { create } from "zustand";
import produce from "immer";

const useStore = create(
    (set) => ({
        isPreferences: false,
        setIsPreferences: (bool) => set(state => produce(state, draft => {
            draft.isPreferences = bool;
        })),
        isVideoInfo: false,
        setIsVideoInfo: (bool) => set(state => produce(state, draft => {
            draft.isVideoInfo = bool;
        })),
        url: "https://m.youtube.com/",
        setURL: (url) => set(state => produce(state, draft => {
            draft.url = url;
        })),
        info: null,
        setInfo: (info) => set(state => produce(state, draft => {
            draft.info = info;
        })),
        language: "ko",
        setLanguage: (language) => set(state => produce(state, draft => {
            draft.language = language;
        })),
        isLoading: false,
        setIsLoading: (bool) => set(state => produce(state, draft => {
            draft.isLoading = bool;
        }))
    })
);

export default useStore;