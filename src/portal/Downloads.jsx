import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Download, Package, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Downloads() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadPurchases() {
      try {
        // Query completed orders (no FK join -- orders.product_slug is text, not FK)
        const { data: orders } = await supabase
          .from('orders')
          .select('id, product_slug, created_at')
          .eq('auth_user_id', user.id)
          .eq('status', 'completed');

        if (!orders || orders.length === 0) {
          setPurchases([]);
          setLoading(false);
          return;
        }

        // Fetch matching products separately
        const slugs = [...new Set(orders.map((o) => o.product_slug))];
        const { data: products } = await supabase
          .from('products')
          .select('slug, name, description, access_grants')
          .in('slug', slugs);

        const productMap = Object.fromEntries(
          (products || []).map((p) => [p.slug, p])
        );

        // Filter to download-type products only
        const downloads = orders
          .filter((o) => productMap[o.product_slug]?.access_grants?.type === 'download')
          .map((o) => ({ ...o, product: productMap[o.product_slug] }));

        setPurchases(downloads);
      } catch (err) {
        console.error('Failed to load purchases:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPurchases();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/portal"
            className="p-2 rounded-full hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Link>
          <div>
            <h1 className="font-outfit font-bold text-2xl text-primary">
              Your Downloads
            </h1>
            <p className="font-sans text-foreground/60 text-sm">
              Access your purchased resources
            </p>
          </div>
        </div>

        {/* Downloads list */}
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary/40" />
            </div>
            <div>
              <h2 className="font-outfit font-semibold text-lg text-primary mb-2">
                No Downloads Yet
              </h2>
              <p className="font-sans text-foreground/60 text-sm max-w-sm">
                When you purchase downloadable resources, they will appear here.
              </p>
            </div>
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Resources
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="border border-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white"
              >
                <div>
                  <h3 className="font-outfit font-semibold text-primary">
                    {purchase.product?.name || purchase.product_slug}
                  </h3>
                  <p className="font-sans text-foreground/50 text-sm mt-1">
                    {purchase.product?.description}
                  </p>
                  <p className="font-sans text-foreground/40 text-xs mt-2">
                    Purchased {new Date(purchase.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors shrink-0"
                  onClick={async () => {
                    const downloadSlug = purchase.product?.access_grants?.download_slug;
                    if (!downloadSlug) return;
                    const { data, error } = await supabase.storage
                      .from('downloads')
                      .createSignedUrl(`${downloadSlug}/${downloadSlug}.pdf`, 86400);
                    if (data?.signedUrl) {
                      window.open(data.signedUrl, '_blank');
                    } else {
                      alert('Download not available yet. Please check back soon.');
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
