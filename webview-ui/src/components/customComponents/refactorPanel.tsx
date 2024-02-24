import React from 'react'
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

const RefactorPanel = ({fileNodes}) => {
  return (
    <div>
      <SheetContent>
          <SheetHeader>
            <SheetTitle>Rebot</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </SheetDescription>
            <SheetTitle>Rebot</SheetTitle>
          </SheetHeader>
        </SheetContent>
    </div>
  )
}

export default RefactorPanel
