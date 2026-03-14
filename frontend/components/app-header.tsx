'use client'

import {
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Bell, HomeIcon, Search } from "lucide-react"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "./ui/command"
import { useState } from "react"

const AppHeader = () => {
    const [open, setOpen] = useState(false)

    return (
        <header className="flex h-16 shrink-0 w-full items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" variant="outline" />
            </div>
            <div className="flex flex-col gap-4 w-full">
                <Button onClick={() => setOpen(true)} variant="outline">
                    <Search /> Search
                </Button>
                <CommandDialog open={open} onOpenChange={setOpen}>
                    <Command>
                        <CommandInput placeholder="Type a command or search..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Navigation">
                                <CommandItem>
                                    <HomeIcon />
                                    <span>Home</span>
                                    <CommandShortcut>⌘H</CommandShortcut>
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </CommandDialog>
            </div>

            <div className="flex items-center gap-2 px-4">
                <Button variant='outline' size="icon-sm">
                    <Bell />
                </Button>
            </div>
        </header>
    )
}

export default AppHeader
