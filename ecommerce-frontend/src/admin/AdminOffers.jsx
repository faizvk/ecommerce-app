import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../utils/notify";
import { Plus, Pencil, Trash2, Sparkles, Clock, Tag, ArrowLeft } from "lucide-react";
import {
  adminFetchOffersThunk,
  adminCreateOfferThunk,
  adminUpdateOfferThunk,
  adminDeleteOfferThunk,
} from "../redux/slice/offerSlice";
import PageHeader from "./components/PageHeader";
import AdminLoader from "./components/AdminLoader";
import EmptyState from "./components/EmptyState";
import ConfirmDialog from "./components/ConfirmDialog";
import OfferForm from "./components/OfferForm";

const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function OfferCard({ offer, onEdit, onDelete, onToggle }) {
  const live = offer.isLive;
  const expired = offer.isExpired;
  const value = offer.discountType === "fixed" ? `₹${offer.discountValue}` : `${offer.discountValue}%`;

  return (
    <div className={`bg-white rounded-2xl border shadow-card overflow-hidden transition-all ${
      live ? "border-brand/30" : expired ? "border-gray-200 opacity-70" : "border-gray-100"
    }`}>
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-bold px-2.5 py-1 rounded-full border ${
            live
              ? "bg-green-50 text-green-700 border-green-200"
              : expired
              ? "bg-gray-100 text-gray-500 border-gray-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-500 animate-pulse" : expired ? "bg-gray-400" : "bg-amber-400"}`} />
            {live ? "LIVE" : expired ? "EXPIRED" : "PAUSED"}
          </span>
          <span className="text-[0.72rem] text-gray-400 font-mono">#{offer._id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggle(offer)}
            className="px-3 py-1.5 text-[0.78rem] font-semibold bg-gray-100 text-gray-700 rounded-lg border-0 cursor-pointer hover:bg-gray-200 transition-all"
          >
            {offer.active ? "Pause" : "Activate"}
          </button>
          <button
            onClick={() => onEdit(offer)}
            className="flex items-center gap-1 px-3 py-1.5 text-[0.78rem] font-semibold bg-brand-light text-brand rounded-lg border-0 cursor-pointer hover:bg-brand hover:text-white transition-all"
          >
            <Pencil size={12} />
            Edit
          </button>
          <button
            onClick={() => onDelete(offer)}
            className="flex items-center gap-1 px-3 py-1.5 text-[0.78rem] font-semibold bg-red-50 text-red-500 rounded-lg border-0 cursor-pointer hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-[#7c3aed] flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-gray-900 truncate">{offer.title}</h3>
            {offer.description && (
              <p className="text-[0.82rem] text-gray-500 line-clamp-2 mt-0.5">{offer.description}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-extrabold text-brand">{value}</p>
            <p className="text-[0.7rem] text-gray-400 uppercase font-bold">off</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[0.78rem] text-gray-500">
            <Tag size={12} className="text-brand flex-shrink-0" />
            <span className="font-semibold">{offer.productIds?.length || 0} products</span>
          </div>
          <div className="flex items-center gap-2 text-[0.78rem] text-gray-500">
            <Clock size={12} className={expired ? "text-red-400 flex-shrink-0" : "text-brand flex-shrink-0"} />
            <span className={expired ? "text-red-500 font-semibold" : "font-semibold"}>
              {expired ? "Ended " : "Ends "}{formatDate(offer.endTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOffers() {
  const dispatch = useDispatch();
  const { adminOffers, loading } = useSelector((state) => state.offer);

  const [view, setView] = useState({ mode: "list", offer: null });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(adminFetchOffersThunk());
  }, [dispatch]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      await dispatch(adminCreateOfferThunk(payload)).unwrap();
      notify.success("Offer created successfully");
      setView({ mode: "list", offer: null });
      dispatch(adminFetchOffersThunk());
    } catch (err) {
      notify.error(err || "Failed to create offer");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!view.offer) return;
    setSaving(true);
    try {
      await dispatch(adminUpdateOfferThunk({ id: view.offer._id, data: payload })).unwrap();
      notify.success("Offer updated");
      setView({ mode: "list", offer: null });
      dispatch(adminFetchOffersThunk());
    } catch (err) {
      notify.error(err || "Failed to update offer");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (offer) => {
    try {
      await dispatch(adminUpdateOfferThunk({ id: offer._id, data: { active: !offer.active } })).unwrap();
      notify.success(offer.active ? "Offer paused" : "Offer activated");
      dispatch(adminFetchOffersThunk());
    } catch (err) {
      notify.error(err || "Failed to update offer");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(adminDeleteOfferThunk(deleteTarget._id)).unwrap();
      notify.success("Offer deleted");
      setDeleteTarget(null);
    } catch (err) {
      notify.error(err || "Failed to delete offer");
    } finally {
      setDeleting(false);
    }
  };

  // CREATE / EDIT VIEWS
  if (view.mode === "create" || view.mode === "edit") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView({ mode: "list", offer: null })}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <PageHeader
            title={view.mode === "create" ? "Create Offer" : "Edit Offer"}
            subtitle={view.mode === "create" ? "Set up a new sale promotion" : view.offer?.title}
          />
        </div>
        <OfferForm
          initialValues={view.mode === "edit" ? view.offer : {}}
          submitLabel={view.mode === "create" ? "Create Offer" : "Save Changes"}
          onSubmit={view.mode === "create" ? handleCreate : handleUpdate}
          saving={saving}
        />
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Offers & Sales"
        subtitle={`${adminOffers.length} total offers`}
        action={
          <button
            onClick={() => setView({ mode: "create", offer: null })}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm border-0 cursor-pointer transition-all hover:bg-brand-dark shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
          >
            <Plus size={16} />
            New Offer
          </button>
        }
      />

      {loading ? (
        <AdminLoader />
      ) : adminOffers.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No offers yet"
          description="Create your first sale promotion to attract customers."
          action={
            <button
              onClick={() => setView({ mode: "create", offer: null })}
              className="px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm border-0 cursor-pointer transition-all hover:bg-brand-dark"
            >
              Create First Offer
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {adminOffers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onEdit={(o) => setView({ mode: "edit", offer: o })}
              onDelete={(o) => setDeleteTarget(o)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this offer?"
        message={deleteTarget ? `"${deleteTarget.title}" will be permanently removed. Affected products will revert to their normal pricing immediately.` : ""}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
