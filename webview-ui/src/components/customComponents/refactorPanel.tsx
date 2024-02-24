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
                    <SheetTitle>Rebot</SheetTitle>
                    <Card className='w-full'>
                        <CardContent className='w-full p-4'>
                            {
                                fileNodes.map((fileNode, index) => (
                                    <div key={index} className='w-full h-[50px] py-4 border border-gray-700 rounded-lg items-center'>
                                        <div className='flex'>
                                            <CiFileOn style={{ marginRight: "3px" }} size={"30px"} />
                                            <div>
                                                {fileNode.data.label}
                                                {fileNode.metadata.path}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>
                    <SheetTitle>Rebot</SheetTitle>
                </SheetHeader>
            </SheetContent>
        </div>
    )
}

export default RefactorPanel
