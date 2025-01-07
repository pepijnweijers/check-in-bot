import { messageState } from "~app/libs/global.state";
import { useRecoilState } from "recoil";

function MessageBox() {
    const [message, setMessage] = useRecoilState(messageState);

    return ( message.message && 
        <p 
            onClick={() => setMessage({})}
            className={`text-xs font-medium mb-2 px-3 py-2 w-full rounded-md cursor-pointer
                ${message.type === "error" 
                    ? "bg-red-800 text-red-200" 
                    : message.type === "success" 
                        && "bg-green-800 text-green-200"}`}
        >
            {message.message}
        </p>
    );
}

export default MessageBox;