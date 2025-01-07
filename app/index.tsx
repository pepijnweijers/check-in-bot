import React, { useEffect } from 'react';
import { IconArrowUpRight, IconCheck, IconLoader2, IconTrash, IconX } from '@tabler/icons-react';
import browser from 'webextension-polyfill';
import { useRecoilState } from 'recoil';
import { evaluationsState, messageState, projectState, urlState } from './libs/global.state';
import MessageBox from './components/MessageBox';
import { Storage } from "@plasmohq/storage";
import useEvaluationCheck from './libs/useEvaluationCheck';

function Popup() {
    const storage = new Storage()
    const [url, setUrl] = useRecoilState(urlState);
    const [project, setProject] = useRecoilState(projectState);
    const [message, setMessage] = useRecoilState(messageState);
    const [evaluation, setEvaluation] = useRecoilState(evaluationsState);
    const projectUrl = `https://student.themarkers.nl/hu:open-ict/projects/${project}`;

    useEffect(() => {
        const load = async () => {
            const fetchedProject = await storage.get("project");
            console.log(Number(fetchedProject))
            setProject(await storage.get("project"));
            
            browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                if (tabs.length > 0) {
                    setUrl(tabs[0].url);
                }
            }).catch((error) => {
                console.error('Error fetching tab URL:', error);
            });
            if(fetchedProject){
                setEvaluation( 
                    await useEvaluationCheck(Number(fetchedProject)) 
                )
            }
        }
        load()
    }, []);

    const Connect = async () => {
        if(url.includes("https://student.themarkers.nl/") && url.includes("projects") && !url.includes("overview")){
            setMessage({
                type: "success",
                message: "Collectie succesvol gekoppeld."
            })
            const projectIdMatch = url.match(/projects\/(\d+)/);
            const projectId = projectIdMatch ? projectIdMatch[1] : null;
            setProject(Number(projectId))
            await storage.set("project", projectId)
            setEvaluation( 
                await useEvaluationCheck(Number(projectId)) 
            )
            if (!evaluation.checkedIn) {
                browser.tabs.create({ url: `https://student.themarkers.nl/hu:open-ict/projects/${projectId}/create-evidence/14` });
            }
        } else {
            browser.tabs.create({
                url: 'https://student.themarkers.nl'
            });
            setMessage({
                type: "error",
                message: "Ga naar een geldige collectie."
            })
        }
    }
    const Disconnect = async () => {
        setMessage({
            type: "success",
            message: "Collectie succesvol ontkoppeld."
        })
        setProject(0)
        await storage.remove("project")
    }

    return (
        <div>
            <MessageBox />
            <h1 className="font-bold text-2xl text-gray-50">Check-ins Bot</h1>
            <p className='mt-2 mb-3'>Mis nooit meer een check-in met deze automatisch check-in bot!</p>
            {project >= 0 && (
                evaluation.count >= 0 ?
                <div className='grid grid-cols-2 gap-2 mb-3'>
                    <div className='bg-white/10 px-5 py-4 rounded-lg'>
                        <span className='text-sm'>Totaal:</span>
                        <p className='font-bold text-2xl text-gray-50'>
                            {evaluation.count}
                        </p>
                    </div>
                    <div className='bg-white/10 px-5 py-4 rounded-lg'>
                        <span className='text-sm'>Ready:</span>
                        <p className='font-bold text-2xl text-gray-50'>
                            {evaluation.checkedIn 
                                ? <IconCheck />
                                : <IconX /> }
                        </p>
                    </div>
                </div>
                :
                <div className='mb-3 py-5 text-center'>
                    <IconLoader2 className='animate-spin mx-auto' />
                </div>
                )
            }

            {project ?
                <div className='flex gap-x-2'>
                    <a 
                        href={projectUrl} 
                        target='_blank' 
                        className='button button-secondary w-full flex items-center justify-center'
                    >
                        Bekijk collectie
                        <IconArrowUpRight />
                    </a>
                    <button 
                        onClick={Disconnect} 
                        disabled={!url.includes(projectUrl)}
                        className='button button-danger'
                    >
                        <IconTrash />
                    </button>
                </div>
                :
                <button onClick={Connect} className='button button-primary w-full'>
                    Koppel Collectie
                </button>
            }
        </div>
    );
}

export default Popup;