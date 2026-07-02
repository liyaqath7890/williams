import { ShieldCheck, Siren, Users, Warehouse } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DisasterMap from '../../maps/DisasterMap';

export default function DisasterMapPage() {
  return (
    <>
      <PageHeader title="Interactive Disaster Map" description="View incidents, shelters, responders, danger zones, safe routes, and live tracking simulations." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={Siren} label="Victim Signals" value="18" tone="danger" />
        <StatCard icon={Warehouse} label="Shelters" value="3" />
        <StatCard icon={Users} label="Helper Teams" value="2" tone="amber" />
        <StatCard icon={ShieldCheck} label="Safe Routes" value="1" tone="slate" />
      </div>
      <DisasterMap />
    </>
  );
}
