"use client"

import { Hotspot } from "./hotspot"

export function InteractiveElements() {
  return (
    <group>
      {/* Reactor Core Hotspots */}
      <Hotspot
        position={[0, 8, 0]}
        title="Calandria Vessel"
        description="Heavy water moderator container"
        category="design"
        details="The calandria vessel contains the heavy water moderator and houses the pressure tubes. It's made of stainless steel and operates at low pressure and temperature compared to the pressure tubes."
        sources={["IAEA PRIS Database", "Siemens Technical Documentation"]}
      />

      <Hotspot
        position={[6, 5, 0]}
        title="Pressure Tubes"
        description="Zirconium alloy tubes containing fuel bundles"
        category="physics"
        details="451 pressure tubes made of zirconium-2.5% niobium alloy contain the fuel bundles and heavy water coolant. Each tube operates at 11.8 MPa pressure and 310°C temperature."
        sources={["Nuclear Engineering International", "CNEA Technical Reports"]}
      />

      <Hotspot
        position={[0, 12, 0]}
        title="Control Rod System"
        description="Neutron-absorbing control rods for reactivity control"
        category="operations"
        details="The reactor uses 32 control rod assemblies containing neutron-absorbing materials to control the nuclear reaction. The rods can be inserted to reduce power or fully inserted for shutdown."
        sources={["IAEA Safety Standards", "Reactor Physics Handbook"]}
      />

      <Hotspot
        position={[18, 8, 0]}
        title="Steam Generator"
        description="Heat exchanger converting water to steam"
        category="operations"
        details="Four steam generators transfer heat from the heavy water coolant to light water, producing steam for the turbine. Each unit is designed for 540 MWt thermal power."
        sources={["Siemens Design Documentation", "ASME Standards"]}
      />

      {/* Safety System Hotspots */}
      <Hotspot
        position={[0, 2, 0]}
        title="Emergency Core Cooling"
        description="Safety system for core cooling during emergencies"
        category="safety"
        details="Multiple independent emergency core cooling systems ensure adequate cooling of the reactor core during loss-of-coolant accidents. The system includes high and low pressure injection systems."
        sources={["IAEA Safety Guide", "Nuclear Safety Analysis"]}
      />

      <Hotspot
        position={[0, 25, 0]}
        title="Containment System"
        description="Multiple barriers preventing radiation release"
        category="safety"
        details="The containment system provides multiple barriers: fuel cladding, pressure boundary, and containment building. The reinforced concrete structure can withstand internal pressure and external hazards."
        sources={["ASME Boiler Code", "Containment Design Standards"]}
      />

      {/* Plant Systems Hotspots */}
      <Hotspot
        position={[40, 15, 0]}
        title="Turbine Generator"
        description="Converts steam energy to electrical power"
        category="operations"
        details="The turbine-generator converts steam energy to 745 MWe gross electrical output. The system includes high and low pressure turbines with moisture separation and reheating."
        sources={["Turbine Design Manual", "Power Plant Engineering"]}
      />

      <Hotspot
        position={[-30, 35, 20]}
        title="Cooling Tower"
        description="Heat rejection system for condenser cooling"
        category="design"
        details="Natural draft cooling towers reject waste heat to the atmosphere. The towers use evaporative cooling to condense steam from the turbine exhaust."
        sources={["Cooling Tower Institute", "Heat Transfer Handbook"]}
      />

      {/* PHWR Specific Features */}
      <Hotspot
        position={[0, 0, 0]}
        title="Heavy Water System"
        description="D2O moderator and coolant systems"
        category="physics"
        details="Heavy water (D2O) serves dual roles as moderator and coolant. The moderator system operates at low pressure while the coolant system operates at high pressure, allowing online refueling."
        sources={["Heavy Water Reactor Technology", "CANDU Design Manual"]}
      />

      <Hotspot
        position={[8, 5, 8]}
        title="Fuel Handling System"
        description="Online refueling capability"
        category="operations"
        details="The PHWR design allows online refueling without shutting down the reactor. Fuel handling machines can replace fuel bundles in individual pressure tubes during operation."
        sources={["Fuel Handling Manual", "PHWR Operations Guide"]}
      />
    </group>
  )
}
