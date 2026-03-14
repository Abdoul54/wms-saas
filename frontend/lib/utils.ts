import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string) {
  return name?.split(' ')?.slice(0, 2)?.map(c => c[0])?.join('')?.toLocaleUpperCase()
}