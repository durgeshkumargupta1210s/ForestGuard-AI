import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  RotateCcw,
  MapPinned,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Trees,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import StatCard from "../../components/common/Card";
import { TableSkeleton } from "../../components/common/Loader";

import AddRegionModal from "../../components/region/AddRegionModal";
import EditRegionModal from "../../components/region/EditRegionModal";
import DeleteRegionModal from "../../components/region/DeleteRegionModal";
import RegionDetailsModal from "../../components/region/RegionDetailsModal";

import {
  getRegions,
  getRegionStatistics,
} from "../../services/region.service";

/* ==========================================================
   Status Badge
========================================================== */

function StatusBadge({ status }) {
  const config = {
    Safe: {
      className: "badge-safe",
      color: "#4ade80",
    },
    Warning: {
      className: "badge-warning",
      color: "#fbbf24",
    },
    Critical: {
      className: "badge-critical",
      color: "#ef4444",
    },
  };

  const badge = config[status] || config.Safe;

  return (
    <span className={`badge ${badge.className}`}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          background: badge.color,
        }}
      />

      {status}
    </span>
  );
}

/* ==========================================================
   NDVI Progress Bar
========================================================== */

function NdviBar({ value = 0 }) {
  const percentage = Math.round(((value + 1) / 2) * 100);

  const color =
    value > 0.4
      ? "#22c55e"
      : value > 0.1
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="flex items-center gap-2">

      <div className="fg-progress w-16">

        <div
          className="fg-progress-bar"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />

      </div>

      <span
        className="text-xs"
        style={{
          color: "var(--text-muted)",
        }}
      >
        {Number(value).toFixed(2)}
      </span>

    </div>
  );
}

/* ==========================================================
   Sortable Table Header
========================================================== */

function SortTh({
  children,
  field,
  sortBy,
  order,
  onSort,
}) {
  const active = field === sortBy;

  return (
    <th
      onClick={() => onSort(field)}
      className="cursor-pointer select-none"
      style={{
        padding: "14px 16px",
        textAlign: "left",
      }}
    >
      <div className="flex items-center gap-1">

        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{
            color: active
              ? "#4ade80"
              : "var(--text-muted)",
          }}
        >
          {children}
        </span>

        <span
          style={{
            color: active
              ? "#4ade80"
              : "var(--text-faint)",
            fontSize: "11px",
          }}
        >
          {active
            ? order === "asc"
              ? "↑"
              : "↓"
            : "↕"}
        </span>

      </div>
    </th>
  );
}

/* ==========================================================
   Action Button
========================================================== */

function ActionBtn({
  icon: Icon,
  title,
  color,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
      style={{
        color: "var(--text-muted)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}18`;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color =
          "var(--text-muted)";
      }}
    >
      <Icon size={15} />
    </button>
  );
}

/* ==========================================================
   Constants
========================================================== */

const LIMIT = 10;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/* ==========================================================
   Region Component
========================================================== */

function Region() {
  const searchTimeout = useRef(null);

  /* ===========================
      State
  ============================ */

  const [regions, setRegions] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    safe: 0,
    warning: 0,
    critical: 0,
  });

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
  });

  const [search, setSearch] = useState("");

  const [stateFilter, setStateFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");

  const [order, setOrder] = useState("desc");

  const [selected, setSelected] = useState(null);

  const [showAdd, setShowAdd] = useState(false);

  const [showView, setShowView] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [showDelete, setShowDelete] = useState(false);

  /* ===========================
      Fetch Regions
  ============================ */

  const fetchRegions = useCallback(
    async (showToast = false) => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: LIMIT,
          search,
          state: stateFilter,
          status: statusFilter,
          sortBy,
          order,
        };

        const [regionRes, statsRes] = await Promise.all([
          getRegions(params),
          getRegionStatistics(),
        ]);

        setRegions(regionRes.data || []);

        setPagination({
          total: regionRes.total || 0,
          pages: regionRes.pages || 1,
        });

        setSummary({
          total: statsRes.total || 0,
          safe: statsRes.safe || 0,
          warning: statsRes.warning || 0,
          critical: statsRes.critical || 0,
        });

        if (showToast) {
          toast.success("Regions refreshed");
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch regions"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      search,
      stateFilter,
      statusFilter,
      sortBy,
      order,
    ]
  );

  /* ===========================
      Effects
  ============================ */

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  /* ===========================
      Search Debounce
  ============================ */

  const handleSearchChange = (value) => {
    setSearch(value);

    setPage(1);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setSearch(value);
    }, 500);
  };

  /* ===========================
      Sorting
  ============================ */

  const handleSort = (field) => {
    if (field === sortBy) {
      setOrder((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  /* ===========================
      View
  ============================ */

  const openView = (region) => {
    setSelected(region);
    setShowView(true);
  };

  /* ===========================
      Edit
  ============================ */

  const openEdit = (region) => {
    setSelected(region);
    setShowEdit(true);
  };

  /* ===========================
      Delete
  ============================ */

  const openDelete = (region) => {
    setSelected(region);
    setShowDelete(true);
  };

  /* ===========================
      Success Callback
  ============================ */

  const handleSuccess = () => {
    fetchRegions();
  };

  /* ===========================
      JSX
  ============================ */

  return (
        <Layout>
      {/* ========================= Header ========================= */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Forest Regions
          </h1>

          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Monitor and manage all registered forest regions.
          </p>
        </div>

        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={18} />
          Add Region
        </button>
      </div>

      {/* ========================= Summary ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Total Regions"
          value={summary.total}
          icon={Trees}
          color="blue"
          loading={loading}
        />

        <StatCard
          title="Safe"
          value={summary.safe}
          icon={CheckCircle2}
          color="green"
          loading={loading}
        />

        <StatCard
          title="Warning"
          value={summary.warning}
          icon={AlertTriangle}
          color="amber"
          loading={loading}
        />

        <StatCard
          title="Critical"
          value={summary.critical}
          icon={XCircle}
          color="red"
          loading={loading}
        />
      </div>

      {/* ========================= Filters ========================= */}

      <div className="fg-card p-4 mb-6 flex flex-wrap gap-4 items-center">

        {/* Search */}

        <div className="relative flex-1 min-w-[280px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />

          <input
            className="fg-input pl-10"
            placeholder="Search by region, district or region ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* State */}

        <select
          className="fg-input w-56"
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All States</option>

          {INDIAN_STATES.map((state) => (
            <option
              key={state}
              value={state}
            >
              {state}
            </option>
          ))}
        </select>

        {/* Status */}

        <select
          className="fg-input w-44"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>

          <option value="Safe">Safe</option>

          <option value="Warning">Warning</option>

          <option value="Critical">Critical</option>
        </select>

        {/* Refresh */}

        <button
          className="btn btn-secondary"
          onClick={() => fetchRegions(true)}
        >
          <RotateCcw size={16} />
        </button>

      </div>

      {/* ========================= Table ========================= */}

      <div className="fg-card overflow-x-auto">

        <table className="fg-table w-full">

          <thead>

            <tr>

              <SortTh
                field="name"
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              >
                Region
              </SortTh>

              <SortTh
                field="state"
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              >
                State
              </SortTh>

              <SortTh
                field="district"
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              >
                District
              </SortTh>

              <SortTh
                field="area"
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              >
                Area (km²)
              </SortTh>

              <SortTh
                field="latestNDVI"
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              >
                NDVI
              </SortTh>

              <SortTh
                field="latestRiskScore"
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              >
                Risk
              </SortTh>

              <SortTh
                field="status"
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              >
                Status
              </SortTh>

              <th className="text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <TableSkeleton
                rows={LIMIT}
                cols={8}
              />

            ) : regions.length === 0 ? (

              <tr>

                <td
                  colSpan={8}
                  className="text-center py-16"
                >

                  <MapPinned
                    size={48}
                    className="mx-auto mb-4"
                    style={{
                      color: "var(--text-muted)",
                    }}
                  />

                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    No Regions Found
                  </h3>

                  <p
                    className="mt-2"
                    style={{
                      color: "var(--text-muted)",
                    }}
                  >
                    Try changing filters or create a new region.
                  </p>

                </td>

              </tr>

            ) : (

              regions.map((region) => (

                <tr key={region._id}>

                  <td>
                    <div className="font-semibold">
                      {region.name}
                    </div>

                    <div
                      className="text-xs"
                      style={{
                        color: "var(--text-muted)",
                      }}
                    >
                      {region.regionId}
                    </div>
                  </td>

                  <td>{region.state}</td>

                  <td>{region.district}</td>

                  <td>{region.area}</td>

                  <td>
                    <NdviBar
                      value={region.latestNDVI}
                    />
                  </td>

                  <td>
                    {region.latestRiskScore}
                  </td>

                  <td>
                    <StatusBadge
                      status={region.status}
                    />
                  </td>

                  <td>

                    <div className="flex justify-center gap-2">

                      <ActionBtn
                        icon={Eye}
                        title="View"
                        color="#3b82f6"
                        onClick={() => openView(region)}
                      />

                      <ActionBtn
                        icon={Pencil}
                        title="Edit"
                        color="#22c55e"
                        onClick={() => openEdit(region)}
                      />

                      <ActionBtn
                        icon={Trash2}
                        title="Delete"
                        color="#ef4444"
                        onClick={() => openDelete(region)}
                      />

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>
      {/* ========================= Pagination ========================= */}
            {/* ========================= Pagination ========================= */}

      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">

          <div
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Showing page <strong>{page}</strong> of{" "}
            <strong>{pagination.pages}</strong>
          </div>

          <div className="flex items-center gap-2">

            <button
              className="btn btn-secondary flex items-center gap-2"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span
              className="px-4 py-2 rounded-lg"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              {page}
            </span>

            <button
              className="btn btn-secondary flex items-center gap-2"
              disabled={page === pagination.pages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>

          </div>

        </div>
      )}

      {/* ========================= View Region ========================= */}

      {showView && selected && (
        <RegionDetailsModal
          open={showView}
          region={selected}
          onClose={() => {
            setShowView(false);
            setSelected(null);
          }}
        />
      )}

      {/* ========================= Add Region ========================= */}

      {showAdd && (
        <AddRegionModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            handleSuccess();
          }}
        />
      )}

      {/* ========================= Edit Region ========================= */}

      {showEdit && selected && (
        <EditRegionModal
          open={showEdit}
          region={selected}
          onClose={() => {
            setShowEdit(false);
            setSelected(null);
          }}
          onSuccess={() => {
            setShowEdit(false);
            setSelected(null);
            handleSuccess();
          }}
        />
      )}

      {/* ========================= Delete Region ========================= */}

      {showDelete && selected && (
        <DeleteRegionModal
          open={showDelete}
          region={selected}
          onClose={() => {
            setShowDelete(false);
            setSelected(null);
          }}
          onSuccess={() => {
            setShowDelete(false);
            setSelected(null);
            handleSuccess();
          }}
        />
      )}

    </Layout>
  );
}

export default Region;