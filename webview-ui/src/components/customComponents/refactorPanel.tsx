import React from 'react'
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import './panel.css';
import { CiFileOn } from "react-icons/ci";
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const RefactorPanel = ({ fileNodes }) => {
    return (
        <div>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Files: </SheetTitle>
                    <div className='w-full py-4 h-[300px] overflow-auto scroll_area'>
                        {
                            fileNodes.map((fileNode, index) => (
                                <div key={index} className='flex flex-row items-start space-y-1 rounded-md border p-4 shadow'>
                                    <div className='flex h-full items-center'>
                                        <CiFileOn size={"40px"} />
                                        <div className='flex flex-col justify-center'>
                                            <h4>
                                                {fileNode.data.label}
                                            </h4>
                                            <p>
                                                {fileNode.metadata.path}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {/* <SheetTitle>Refactoring rules:</SheetTitle>
                    <CheckboxReactHookFormMultiple />; */}

                </SheetHeader>
                <SheetTitle>Custom prompt:</SheetTitle>
                <Textarea className="my-4" placeholder="Type your prompt here." />
                <div className=''>
                    <Button>Refactor</Button>
                </div>
            </SheetContent>
        </div>
    )
}

export default RefactorPanel
