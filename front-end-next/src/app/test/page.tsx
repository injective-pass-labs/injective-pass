"use client";
import { useState } from 'react';
import { ContractApi, NfcApi } from '@/lib/api';
import type { WalletResponse, SocialInteractionResp, CatNFT, DrawStats as DrawStatsType } from '@/types/nfc';
import { NfcRegisterForm, SocialInteractionForm, DrawWithTicketsForm, DomainRegisterForm } from '@/components';

type ContractStatus = {
    nfcRegistry: boolean;
    domainNFT: boolean;
    catNFT: boolean;
    networkInfo?: Record<string, unknown>;
};

export default function TestPage() {
    const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
    const [wallet, setWallet] = useState<WalletResponse | null>(null);
    const [social, setSocial] = useState<SocialInteractionResp | null>(null);
    const [cat, setCat] = useState<CatNFT | null>(null);
    const [drawStats, setDrawStats] = useState<DrawStatsType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkContract = async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await ContractApi.status();
            setContractStatus(res as ContractStatus);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg || '获取合约状态失败');
        } finally {
            setLoading(false);
        }
    };

    const refreshDrawStats = async () => {
        if (!wallet?.nfcCard?.uid) return;
        setError(null);
        setLoading(true);
        try {
            const stats = await NfcApi.drawStats(wallet.nfcCard.uid);
            setDrawStats(stats as DrawStatsType);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg || '获取抽卡统计失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-8">
            <header className="space-y-2">
                <h1 className="text-2xl font-bold">Injective Pass 前端最小测试页</h1>
                <p className="text-sm text-gray-600">用于验证与后端 API 的连通与组件回调</p>
            </header>

            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <button onClick={checkContract} className="bg-black text-white px-3 py-1 rounded disabled:opacity-60" disabled={loading}>
                        {loading ? '检查中...' : '检查合约状态'}
                    </button>
                    {error && <span className="text-red-600 text-sm">{error}</span>}
                </div>
                {contractStatus && (
                    <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{JSON.stringify(contractStatus, null, 2)}</pre>
                )}
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">1) 注册 NFC</h2>
                <NfcRegisterForm onRegistered={(res) => setWallet(res)} />
                {wallet && (
                    <div className="space-y-2">
                        <h3 className="font-medium">注册结果</h3>
                        <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{JSON.stringify(wallet, null, 2)}</pre>
                    </div>
                )}
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">2) 社交互动（获取抽卡券）</h2>
                <SocialInteractionForm onSuccess={(res) => { setSocial(res); refreshDrawStats(); }} />
                {social && (
                    <div className="space-y-2">
                        <h3 className="font-medium">互动结果</h3>
                        <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{JSON.stringify(social, null, 2)}</pre>
                    </div>
                )}
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">3) 用券抽卡</h2>
                <DrawWithTicketsForm onDrawn={(c) => { setCat(c); refreshDrawStats(); }} />
                {cat && (
                    <div className="space-y-2">
                        <h3 className="font-medium">抽卡结果</h3>
                        {cat.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cat.imageUrl} alt={cat.name} className="w-40 h-40 object-cover rounded border" />
                        )}
                        <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{JSON.stringify(cat, null, 2)}</pre>
                    </div>
                )}
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">4) 抽卡统计（可选）</h2>
                <div className="flex items-center gap-3">
                    <button onClick={refreshDrawStats} className="bg-black text-white px-3 py-1 rounded disabled:opacity-60" disabled={loading || !wallet?.nfcCard?.uid}>
                        {loading ? '刷新中...' : '刷新统计'}
                    </button>
                    {!wallet?.nfcCard?.uid && <span className="text-sm text-gray-500">请先完成注册，才能查询统计</span>}
                </div>
                {drawStats && (
                    <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto">{JSON.stringify(drawStats, null, 2)}</pre>
                )}
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">5) 注册域名（可选）</h2>
                <DomainRegisterForm />
            </section>
        </main>
    );
}
