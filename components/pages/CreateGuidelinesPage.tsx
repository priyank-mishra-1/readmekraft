"use client";

import { FormatGuidelinesData } from "@/actions/themeDataFormat";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { guidelinesFormData } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Check, CopyIcon, GripVertical } from "lucide-react";
import CreateGuidelinesForm from "../CreateGuidelinesForm";
import RenderMarkdown from "../RenderMarkdown";
import { GenerateContentWithAI } from "@/actions/AIGeneration";
import {Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

type Props = {
    themeFiles: string[];
    markdownPath: string;
}

const CreateGuidelinesPage = ({ themeFiles, markdownPath }: Props) => {
    const { toast } = useToast();
    const [selectedTheme, setSelectedTheme] = useState(themeFiles[0]);
    const [formData, setFormData] = useState<guidelinesFormData>({
        name: "Project",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem, harum sequi dolorem ex adipisci, id cum possimus neque veniam porro autem voluptatibus qui.",
    });
    const [themeContent, setThemeContent] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [isRawMode, setIsRawMode] = useState(false);
    const [generating, setGenerating] = useState(false);

    const getThemeData = async () => {
        const newData = await FormatGuidelinesData(formData, markdownPath, selectedTheme);
        setThemeContent(newData);
    }

    useEffect(() => {
        getThemeData();
    }, [markdownPath, selectedTheme])

    const handleButtonClick = async () => {
        const newData = await FormatGuidelinesData(formData, markdownPath, selectedTheme);
        setThemeContent(newData);
    }

    const handleContentCopy = () => {
        navigator.clipboard.writeText(themeContent);
        toast({
            title: "Copied to clipboard!",
            description: "Now you can paste the content wherever you want.",
        });
        setIsCopied(true);
        setInterval(() => {
            setIsCopied(false);
        }, 2000)
    }

    const handleMarkdownChange = (e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        setThemeContent(e.target.value);
    }
    
    const getAIText = async () => {
        setGenerating(true);
        const systemPrompt = "You are an AI that can write SEO friendly README for github Projects. Write the content for the description section of this REAMDE in about 100 words. Use emojis, bullet points and make the README as attractive as possible.";
        const res = await GenerateContentWithAI(systemPrompt, formData.description);
        setGenerating(false);
        setFormData({ ...formData, description: res })
    }

    return (
        <div className='w-full p-4 min-h-screen h-auto bg-gray-50 dark:bg-zinc-900'>
            <CreateGuidelinesForm formData={formData} setFormData={setFormData} handleButtonClick={handleButtonClick} getAIText={getAIText} isAIGenerating={generating} />
            <div className="w-full pb-2 shadow-lg rounded-lg h-full bg-background dark:shadow-zinc-600">
                <div className="flex gap-4 w-full justify-end p-2">
                    <Button variant={"outline"} className={`h-[40px] w-[40px] p-0 ${isCopied && "bg-green-300 hover:bg-green-300"}`} onClick={handleContentCopy}>
                        {!isCopied ?
                            <CopyIcon size={20} />
                            : <Check />
                        }
                    </Button>
                    <Button variant={'outline'} className={`h-[40px] w-32 p-0`} onClick={()=>setIsRawMode(!isRawMode)}>
                        {isRawMode ? 'Raw + Preview': 'Preview only'}
                    </Button>
                    <Select onValueChange={(value) => setSelectedTheme(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={themeFiles[0].split(".")[0]} defaultValue={themeFiles[0]} />
                        </SelectTrigger>
                        <SelectContent>
                            {themeFiles.map((file, index) => (
                                <SelectItem key={`theme-${index}`} value={file}>{file.split(".")[0]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <PanelGroup direction="horizontal">
                    <Panel id="preview" order={1} defaultSize={isRawMode ? 49 : 100}>
                        <div>
                        <RenderMarkdown themeContent={themeContent} />
                        </div>
                    </Panel>
                    {isRawMode ? (
                        <>
                            <PanelResizeHandle className="flex justify-center items-center w-px mx-4 bg-slate-600">
                                <div className="z-10 flex h-full w-6 items-center justify-center rounded">
                                    <GripVertical className="bg-white dark:bg-background" />
                                </div>
                            </PanelResizeHandle>
                            <Panel id="raw" order={2} defaultSize={51}>
                                <div className="h-full mr-2">
                                <textarea 
                                    value={themeContent} 
                                    onChange={handleMarkdownChange}
                                    className="w-full h-full p-4 rounded-lg text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-white"
                                />
                                </div>
                            </Panel>
                        </>
                    ) : (<></>)
                } 
                </PanelGroup>
            </div>
        </div>
    )
}

export default CreateGuidelinesPage