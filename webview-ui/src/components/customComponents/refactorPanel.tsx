import React from 'react'
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import './panel.css';
import { Card, CardContent } from '@/components/ui/card';
import { CiFileOn } from "react-icons/ci";

const RefactorPanel = ({ fileNodes }) => {
    return (
        <div>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Files: </SheetTitle>
                    <Card className='w-full'>
                        <CardContent className='w-full p-4 h-[300px] overflow-auto scroll_area'>
                            {
                                fileNodes.map((fileNode, index) => (
                                    <div key={index} className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow'>
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
                        </CardContent>
                    </Card>
                    <SheetTitle>Refactoring rules:</SheetTitle>

                </SheetHeader>
            </SheetContent>
        </div>
    )
}

export default RefactorPanel
