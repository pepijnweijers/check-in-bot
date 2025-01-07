import { atom } from "recoil";

export const urlState = atom<string>({
    key: 'urlState',
    default: ''
});

export const projectState = atom<number>({
    key: 'projectState',
    default: 0
});

export const checkinState = atom<number>({
    key: 'checkinState',
    default: 0
});

interface MessageProps {
    type?: "error" | "success",
    message?: string
}

export const messageState = atom<MessageProps>({
    key: 'messageState',
    default: { }
});

interface EvaluationsProp {
    count: number,
    checkedIn: boolean
}

export const evaluationsState = atom<EvaluationsProp>({
    key: 'evaluationsState',
    default: {
        count: -1,
        checkedIn: false
    }
});