'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowDownToLine, ArrowUpRight, Check, CircleHelp, Copy, FileArchive, Search, ShieldCheck, Terminal } from 'lucide-react'

type Asset = { id: number; name: string; platform: string; arch: string; size: string; downloads: number; browserDownloadUrl: string; digest: string | null }
type Release = { id: number; version: string; title: string | null; date: string | null; tag: boolean; prerelease: boolean; notes: string; htmlUrl: string; assets: Asset[] }
type ReleasesResponse = { repository: { owner: string; name: string; url: string }; releases: Release[]; error?: string }

const filters = ['All platforms', 'macOS', 'Windows', 'Linux', 'Checksums', 'Archive', 'Other']
const fetcher = async (url: string): Promise<ReleasesResponse> => {
  const response = await fetch(url)
  const result = await response.json() as ReleasesResponse
  if (!response.ok) throw new Error(result.error || 'Could not load releases.')
  return result
}

function GitHubMark({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
}

function formatDate(date: string | null) {
  if (!date) return 'Date unavailable'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(date))
}

function formatDownloads(downloads: number) {
  return new Intl.NumberFormat('en', { notation: downloads >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(downloads)
}

export default function Page() {
  const { data, error, isLoading } = useSWR<ReleasesResponse>('/api/releases', fetcher, { revalidateOnFocus: false })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All platforms')
  const [copied, setCopied] = useState(false)
  const releases = data?.releases ?? []
  const visibleReleases = useMemo(() => releases.map((release) => ({
    ...release,
    assets: release.assets.filter((asset) => (filter === 'All platforms' || asset.platform === filter) && `${asset.name} ${asset.platform} ${asset.arch}`.toLowerCase().includes(query.toLowerCase())),
  })).filter((release) => release.assets.length), [releases, filter, query])
  const orderedReleases = [...visibleReleases].sort((left, right) => Number(right.tag) - Number(left.tag))

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText('git clone https://github.com/daulric-dev/gb.git')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const repositoryUrl = data?.repository.url ?? 'https://github.com/daulric-dev/gb'
  const repositoryOwner = data?.repository.owner ?? 'daulric-dev'
  const repositoryName = data?.repository.name ?? 'gb'

  return (
    <main className="min-h-screen bg-[#f4eee6] text-[#151821]">
      <header className="border-b border-[#e6d9cb] bg-white">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-[-0.03em]" aria-label="GB downloads home"><Image src="/logo.png" alt="" width={32} height={32} className="rounded-[10px]" /><span className="text-[17px]">Gradebook</span></a>
          <nav className="hidden items-center gap-8 text-[13px] font-medium text-[#707584] sm:flex"><a className="text-[#272a35]" href="#releases">Releases</a><a className="transition hover:text-[#272a35]" href="#install">Installation</a><a className="transition hover:text-[#272a35]" href={`${repositoryUrl}/releases`} target="_blank" rel="noreferrer">Release page <ArrowUpRight size={13} className="ml-0.5 inline" /></a></nav>
          <a href={repositoryUrl} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 rounded-lg border border-[#e6d9cb] px-3 text-[12px] font-semibold transition hover:border-[#bfc3cd] hover:bg-[#fafbfc]"><GitHubMark size={15} /><span className="hidden sm:inline">View on GitHub</span><span className="sm:hidden">GitHub</span></a>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-[1180px] px-5 pb-8 pt-12 lg:px-8 lg:pb-10 lg:pt-[68px]">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#8b8f9b]"><span>Home</span><span className="text-[#c4c7ce]">/</span><span>Downloads</span><span className="text-[#c4c7ce]">/</span><span className="font-medium text-[#5e6270]">GB</span></div>
        <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><div className="mb-4 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#242631] text-white"><GitHubMark size={15} /></span><span className="text-[13px] font-medium text-[#767b89]">{repositoryOwner} <span className="text-[#c0c3ca]">/</span> {repositoryName}</span><span className="rounded-full border border-[#e6d9cb] bg-white px-2 py-0.5 text-[10px] font-medium text-[#747887]">Public</span></div><h1 className="text-[38px] font-semibold leading-[1.1] tracking-[-0.055em]">Releases</h1><p className="mt-3 max-w-[540px] text-[14px] leading-6 text-[#7a7f8d]">Browse releases for {repositoryOwner}/{repositoryName}. Download a package or checksum directly from GitHub.</p></div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2.5"><div className="flex items-center gap-2 rounded-lg border border-[#e9ddd0] bg-white px-3 py-2 text-xs text-[#626775]"><span className="font-semibold text-[#383b46]">Latest</span><span className="rounded bg-[#eaeaff] px-1.5 py-0.5 font-semibold text-[#b76549]">{isLoading ? 'Loading' : releases.find((release) => release.tag)?.version ?? 'No releases'}</span></div><div className="flex items-center gap-2 rounded-lg border border-[#e9ddd0] bg-white px-3 py-2 text-xs text-[#626775]"><ShieldCheck size={14} className="text-[#42a879]"/>Assets hosted by GitHub</div></div>
      </section>

      <section id="releases" className="mx-auto max-w-[1180px] px-5 pb-16 lg:px-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-[18px] font-semibold tracking-[-0.025em]">Available releases</h2><p className="mt-1 text-[12px] text-[#858997]">Packages and download counts are fetched from GitHub.</p></div><div className="relative w-full sm:w-[238px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da1ad]"/><input aria-label="Search release files" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files..." className="h-9 w-full rounded-lg border border-[#e6d9cb] bg-white pl-9 pr-3 text-xs outline-none transition placeholder:text-[#a3a6b0] focus:border-[#9899eb] focus:ring-2 focus:ring-[#b76549]/10"/></div></div>
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">{filters.map((item) => <Button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} variant={filter === item ? 'default' : 'outline'} size="sm" className={`h-auto shrink-0 rounded-xl px-3 py-1.5 text-[11px] ${filter === item ? 'bg-[#b76549] text-white shadow-[3px_3px_7px_rgba(130,80,55,0.2),-2px_-2px_6px_rgba(255,252,246,0.8)] hover:bg-[#96513a]' : 'border-[#e6d9cb] bg-[#f8f3ec] text-[#737785] shadow-[3px_3px_7px_rgba(130,100,73,0.09),-2px_-2px_6px_rgba(255,252,246,0.9)] hover:bg-[#eee4d9]'}`}>{item}</Button>)}</div>
        <div className="space-y-3">
          {isLoading ? <div className="rounded-xl border border-[#e6d9cb] bg-white px-5 py-12 text-center text-sm text-[#858997]">Loading releases from GitHub…</div> : error ? <div role="alert" className="rounded-xl border border-[#f0d6d6] bg-white px-5 py-10 text-center"><p className="text-sm font-medium text-[#424550]">Couldn&apos;t load GitHub releases</p><p className="mt-2 text-xs text-[#9094a0]">{error.message}</p><a href={`${repositoryUrl}/releases`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#b76549]">Open releases on GitHub <ArrowUpRight size={13}/></a></div> : visibleReleases.length ? orderedReleases.map((release, index) => <div key={release.id} className="space-y-3">{(index === 0 || (index === 1 && orderedReleases[0]?.tag)) && <h3 className="pt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#8b7565]">{release.tag ? 'Latest release' : 'Previous releases'}</h3>}<article className="overflow-hidden rounded-xl border border-[#e6d9cb] bg-white shadow-[0_1px_2px_rgba(21,24,33,0.025)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecdfd3] px-4 py-3.5 sm:px-5"><div className="flex flex-wrap items-center gap-2.5"><span className="text-[16px] font-semibold tracking-[-0.035em]">{release.version}</span>{release.tag && <span className="rounded-md bg-[#eaeaff] px-2 py-1 text-[10px] font-semibold text-[#b76549]">Latest</span>}{release.prerelease && <span className="rounded-md bg-[#fff3dc] px-2 py-1 text-[10px] font-semibold text-[#9d681c]">Pre-release</span>}<span className="text-[11px] text-[#969aa5]">Released {formatDate(release.date)}</span></div><a href={release.htmlUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-medium text-[#797e8c] transition hover:text-[#b76549]">Release notes <ArrowUpRight size={12}/></a></div>
            {release.notes !== 'No release notes were provided for this version.' && <p className="line-clamp-3 whitespace-pre-line px-4 pt-3 text-[12px] leading-5 text-[#777c89] sm:px-5">{release.notes}</p>}
            <div className="px-3 pb-2 pt-2 sm:px-4"><div className="hidden grid-cols-[minmax(0,1fr)_130px_90px_96px] items-center px-2 py-2 text-[10px] font-medium uppercase tracking-[0.07em] text-[#a0a3ad] sm:grid"><span>Package</span><span>Platform</span><span>Size</span><span className="text-right">Downloads</span></div>
              {release.assets.filter((asset) => filter === 'All platforms' || asset.platform === filter).filter((asset) => `${asset.name} ${asset.platform} ${asset.arch}`.toLowerCase().includes(query.toLowerCase())).map((asset) => <div key={asset.id} className="group flex flex-col gap-3 rounded-lg px-2 py-3 transition hover:bg-[#f8f9fb] sm:grid sm:grid-cols-[minmax(0,1fr)_130px_90px_96px] sm:items-center sm:gap-0"><div className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#e9ddd0] bg-white text-[#747989]"><FileArchive size={15}/></span><div className="min-w-0"><p className="truncate text-[12px] font-medium text-[#343742]">{asset.name}</p><p className="mt-0.5 text-[10px] text-[#a0a3ad] sm:hidden">{asset.platform} · {asset.arch} · {asset.size}</p></div></div><span className="hidden text-[11px] text-[#737785] sm:block">{asset.platform} <span className="text-[#a2a5af]">· {asset.arch}</span></span><span className="hidden text-[11px] text-[#737785] sm:block">{asset.size}</span><div className="flex items-center justify-between sm:justify-end sm:gap-3"><span className="text-[10px] text-[#a0a3ad] sm:hidden">{formatDownloads(asset.downloads)} downloads</span><span className="hidden text-[10px] text-[#a0a3ad] sm:inline">{formatDownloads(asset.downloads)}</span><a href={asset.browserDownloadUrl} aria-label={`Download ${asset.name}`} className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#b76549] px-3 text-[11px] font-medium text-white transition hover:bg-[#96513a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b76549] focus-visible:ring-offset-2"><ArrowDownToLine size={13}/>Download</a></div></div>)}
            </div>
          </article></div>) : <div className="rounded-xl border border-dashed border-[#dfe1e7] bg-white py-14 text-center"><Search size={20} className="mx-auto text-[#b7bac4]"/><p className="mt-3 text-sm font-medium text-[#424550]">{releases.length ? 'No matching files' : 'No published releases yet'}</p><p className="mt-1 text-xs text-[#9094a0]">{releases.length ? 'Try another search or platform filter.' : 'Published GitHub releases will show up here automatically.'}</p></div>}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#969aa5]"><CircleHelp size={13}/>Need help with a release? <a href={`${repositoryUrl}/issues`} target="_blank" rel="noreferrer" className="font-medium text-[#666a78] underline decoration-[#c6c8d0] underline-offset-2 hover:text-[#b76549]">Open an issue</a></div>
      </section>

      <section id="install" className="border-t border-[#e8eaf0] bg-white"><div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f1ff] text-[#b76549]"><Terminal size={17}/></span><div><h2 className="text-[13px] font-semibold">Get the source</h2><p className="mt-1 text-[11px] text-[#828693]">Clone the public repository to build it yourself.</p></div></div><button onClick={copyCommand} className="flex max-w-full items-center justify-between gap-5 rounded-lg border border-[#e9eaee] bg-[#fafbfc] px-3 py-2.5 text-left font-mono text-[11px] text-[#555968] transition hover:border-[#d7d9e0]" aria-label="Copy git clone command"><span><span className="mr-2 text-[#acafba]">$</span>git clone https://github.com/daulric-dev/gb.git</span><span className="text-[#8e92a0]">{copied ? <Check size={14} className="text-[#42a879]"/> : <Copy size={14}/>}</span></button></div></section>
      <footer className="border-t border-[#e6d9cb] bg-[#f4eee6]"><div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 px-5 py-5 text-[10px] text-[#989ca7] sm:flex-row lg:px-8"><span>Release information is fetched from GitHub.</span><div className="flex items-center gap-4"><a href={repositoryUrl} target="_blank" rel="noreferrer" className="hover:text-[#b76549]">GitHub</a><a href={`${repositoryUrl}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="hover:text-[#b76549]">License</a><a href={`${repositoryUrl}/issues`} target="_blank" rel="noreferrer" className="hover:text-[#b76549]">Support</a></div></div></footer>
    </main>
  )
}
