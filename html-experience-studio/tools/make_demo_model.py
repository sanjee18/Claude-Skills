"""Builds examples/model-demo/inspection-drone.glb – a procedural demo model (own work, MIT) for the 3D model scene.

Every part is a named node (Battery, Gimbal, LiDAR, Motor_FL …) so briefs can point notes/focus at it, and it has internal
parts (battery, flight controller) that only show in the x-ray look. Clip "Rotors" spins the propellers (loop).
Run: python tools/make_demo_model.py
"""
import json, math, struct
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "examples" / "model-demo" / "inspection-drone.glb"


# ---------------- geometry helpers (y up, metres) ----------------
def grid_mesh(rows, cols, fn):
    """fn(u, v) -> (pos, normal); u in [0,1] around, v in [0,1] along. Closed in u."""
    P, N, I = [], [], []
    for r in range(rows + 1):
        for c in range(cols + 1):
            p, n = fn(c / cols, r / rows)
            P.append(p); N.append(n)
    for r in range(rows):
        for c in range(cols):
            a = r * (cols + 1) + c; b = a + cols + 1
            I += [a, b, a + 1, a + 1, b, b + 1]
    return P, N, I


def norm(v):
    l = math.sqrt(sum(x * x for x in v)) or 1
    return [x / l for x in v]


def superellipsoid(rx, ry, rz, e1=.35, e2=.35, seg=48):
    sg = lambda w, m: math.copysign(abs(w) ** m, w)
    def f(u, v):
        th, ph = u * 2 * math.pi - math.pi, v * math.pi - math.pi / 2
        cp, sp, ct, st = math.cos(ph), math.sin(ph), math.cos(th), math.sin(th)
        p = [rx * sg(cp, e1) * sg(ct, e2), ry * sg(sp, e1), rz * sg(cp, e1) * sg(st, e2)]
        n = norm([sg(cp, 2 - e1) * sg(ct, 2 - e2) / rx, sg(sp, 2 - e1) / ry, sg(cp, 2 - e1) * sg(st, 2 - e2) / rz])
        return p, n
    return grid_mesh(seg, seg, f)


def sphere(r, seg=32):
    def f(u, v):
        th, ph = u * 2 * math.pi, v * math.pi - math.pi / 2
        n = [math.cos(ph) * math.cos(th), math.sin(ph), math.cos(ph) * math.sin(th)]
        return [r * x for x in n], n
    return grid_mesh(seg, seg, f)


def torus(R, r, seg=48, tube=16):
    def f(u, v):
        a, b = u * 2 * math.pi, v * 2 * math.pi
        n = [math.cos(b) * math.cos(a), math.sin(b), math.cos(b) * math.sin(a)]
        return [(R + r * math.cos(b)) * math.cos(a), r * math.sin(b), (R + r * math.cos(b)) * math.sin(a)], n
    return grid_mesh(seg, tube, lambda u, v: f(v, u))


def cylinder(r, h, seg=32, r2=None):
    """along y, centred; caps included"""
    r2 = r if r2 is None else r2
    P, N, I = [], [], []
    slope = (r - r2) / h
    for k in range(seg + 1):
        a = k / seg * 2 * math.pi; c, s = math.cos(a), math.sin(a)
        n = norm([c, slope, s])
        P += [[r * c, -h / 2, r * s], [r2 * c, h / 2, r2 * s]]; N += [n, n]
    for k in range(seg):
        a = 2 * k; I += [a, a + 1, a + 2, a + 2, a + 1, a + 3]
    for y, rr, ny in ((-h / 2, r, -1), (h / 2, r2, 1)):
        base = len(P); P.append([0, y, 0]); N.append([0, ny, 0])
        for k in range(seg + 1):
            a = k / seg * 2 * math.pi; P.append([rr * math.cos(a), y, rr * math.sin(a)]); N.append([0, ny, 0])
        for k in range(seg):
            I += ([base, base + k + 2, base + k + 1] if ny > 0 else [base, base + k + 1, base + k + 2])
    return P, N, I


def box(x, y, z, bevel=.0):
    if bevel:
        return superellipsoid(x / 2, y / 2, z / 2, .12, .12, 16)
    P, N, I = [], [], []
    for ax in range(3):
        for sgn in (-1, 1):
            n = [0, 0, 0]; n[ax] = sgn
            u, v = [(ax + 1) % 3, (ax + 2) % 3]
            base = len(P)
            for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                p = [0, 0, 0]; p[ax] = sgn * [x, y, z][ax] / 2; p[u] = a * [x, y, z][u] / 2; p[v] = b * [x, y, z][v] / 2
                P.append(p); N.append(n)
            I += ([base, base + 1, base + 2, base, base + 2, base + 3] if sgn > 0 else [base, base + 2, base + 1, base, base + 3, base + 2])
    return P, N, I


def blade(length, width, thick, twist=.35):
    P, N, I = [], [], []
    seg = 12
    for side in (-1, 1):
        for k in range(seg + 1):
            t = k / seg; x = side * length * t; w = width * (1 - .55 * t) * (.6 + .4 * math.sin(math.pi * min(1, t * 1.4)))
            a = twist * (1 - t) * side
            for e in (-1, 1):
                z = e * w / 2; y = z * math.sin(a) + thick
                P.append([x, y, z * math.cos(a)]); N.append([0, 1, 0])
    for side in range(2):
        o = side * (seg + 1) * 2
        for k in range(seg):
            a = o + 2 * k
            I += ([a, a + 1, a + 2, a + 2, a + 1, a + 3] if side else [a, a + 2, a + 1, a + 2, a + 3, a + 1])
    # double sided: duplicate reversed
    n = len(P); P += P[:]; N += [[0, -1, 0]] * n; I += [i + n for t in range(0, len(I), 3) for i in (I[t], I[t + 2], I[t + 1])]
    return P, N, I


def quat_axis(ax, deg):
    a = math.radians(deg) / 2; s = math.sin(a)
    return [ax[0] * s, ax[1] * s, ax[2] * s, math.cos(a)]


# ---------------- glTF writer ----------------
class GLB:
    def __init__(self):
        self.bin = bytearray(); self.views = []; self.acc = []; self.meshes = []; self.nodes = []; self.mats = []; self.matid = {}
        self.anims = []

    def _view(self, data, target=None):
        while len(self.bin) % 4: self.bin += b"\0"
        off = len(self.bin); self.bin += data
        v = {"buffer": 0, "byteOffset": off, "byteLength": len(data)}
        if target: v["target"] = target
        self.views.append(v); return len(self.views) - 1

    def _acc(self, arr, comp, typ, target=None, minmax=False):
        flat = [x for a in arr for x in (a if isinstance(a, (list, tuple)) else [a])]
        fmt = {"f": "<%df", "I": "<%dI"}[comp] % len(flat)
        view = self._view(struct.pack(fmt, *flat), target)
        a = {"bufferView": view, "componentType": 5126 if comp == "f" else 5125, "count": len(arr), "type": typ}
        if minmax:
            k = len(arr[0]); a["min"] = [min(p[i] for p in arr) for i in range(k)]; a["max"] = [max(p[i] for p in arr) for i in range(k)]
        self.acc.append(a); return len(self.acc) - 1

    def mat(self, name, color, metal=0., rough=.5, emissive=None):
        if name in self.matid: return self.matid[name]
        m = {"name": name, "pbrMetallicRoughness": {"baseColorFactor": color + [1], "metallicFactor": metal, "roughnessFactor": rough}}
        if emissive: m["emissiveFactor"] = emissive
        if name == "blade": m["doubleSided"] = True
        self.mats.append(m); self.matid[name] = len(self.mats) - 1; return self.matid[name]

    def mesh(self, geo, mat):
        P, N, I = geo
        prim = {"attributes": {"POSITION": self._acc(P, "f", "VEC3", 34962, True), "NORMAL": self._acc(N, "f", "VEC3", 34962)},
                "indices": self._acc(I, "I", "SCALAR", 34963), "material": mat}
        self.meshes.append({"primitives": [prim]}); return len(self.meshes) - 1

    def node(self, name, geo=None, mat=None, t=None, r=None, s=None, children=None):
        n = {"name": name}
        if geo is not None: n["mesh"] = self.mesh(geo, mat)
        if t: n["translation"] = t
        if r: n["rotation"] = r
        if s: n["scale"] = s
        if children: n["children"] = children
        self.nodes.append(n); return len(self.nodes) - 1

    def save(self, path, roots):
        while len(self.bin) % 4: self.bin += b"\0"
        g = {"asset": {"version": "2.0", "generator": "html-experience-studio make_demo_model.py"}, "scene": 0,
             "scenes": [{"nodes": roots}], "nodes": self.nodes, "meshes": self.meshes, "materials": self.mats,
             "accessors": self.acc, "bufferViews": self.views, "buffers": [{"byteLength": len(self.bin)}]}
        if self.anims: g["animations"] = self.anims
        js = json.dumps(g, separators=(",", ":")).encode()
        while len(js) % 4: js += b" "
        out = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(self.bin))
        out += struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(self.bin), 0x004E4942) + bytes(self.bin)
        path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(out)


def build():
    G = GLB()
    shell = G.mat("shell", [.86, .87, .89], .1, .28)
    graph = G.mat("graphite", [.07, .075, .085], .3, .42)
    carbon = G.mat("carbon", [.03, .03, .035], .2, .55)
    metal = G.mat("metal", [.62, .64, .68], 1., .22)
    glass = G.mat("lens", [.01, .015, .02], .0, .05)
    blade_m = G.mat("blade", [.05, .05, .06], .1, .35)
    bat = G.mat("battery", [.16, .3, .5], .2, .5)
    pcb = G.mat("pcb", [.05, .32, .2], .1, .6)
    led = G.mat("led", [.2, .9, 1.], 0, .3, [.2, .9, 1.])
    ledr = G.mat("led-red", [1., .2, .15], 0, .3, [1., .2, .12])

    kids = []
    kids.append(G.node("Body_Shell", superellipsoid(.62, .16, .36, .32, .32), shell, t=[0, .42, 0]))
    kids.append(G.node("Body_Base", superellipsoid(.55, .07, .31, .4, .4), graph, t=[0, .3, 0]))
    kids.append(G.node("Battery", box(.5, .14, .22, .02), bat, t=[-.06, .42, 0]))
    kids.append(G.node("FlightController", box(.2, .025, .18), pcb, t=[.22, .5, 0]))
    kids.append(G.node("GPS_Module", cylinder(.11, .05, 40), graph, t=[-.18, .6, 0]))
    kids.append(G.node("LiDAR", cylinder(.075, .1, 40), metal, t=[.48, .55, 0]))
    kids.append(G.node("LiDAR_Window", cylinder(.078, .045, 40), glass, t=[.48, .56, 0]))
    gim = G.node("Gimbal_Lens", cylinder(.05, .06, 32), glass, t=[.0, 0, .09], r=quat_axis([1, 0, 0], 90))
    kids.append(G.node("Gimbal", sphere(.105, 36), graph, t=[.5, .22, 0], children=[gim]))
    kids.append(G.node("Gimbal_Mount", cylinder(.035, .12, 20), metal, t=[.5, .3, 0]))
    rotor_nodes = []
    for nm, sx, sz in (("FL", 1, 1), ("FR", 1, -1), ("RL", -1, 1), ("RR", -1, -1)):
        ang = math.degrees(math.atan2(sz * .62, sx * .85))
        L = math.hypot(.85, .62) - .3
        mid = [sx * .85 / 2 * 1.15, .4, sz * .62 / 2 * 1.15]
        kids.append(G.node("Arm_" + nm, cylinder(.035, L, 24, .028), carbon, t=mid, r=[0, 0, 0, 1] if False else
                           [*[x for x in quat_mul(quat_axis([0, 1, 0], -ang), quat_axis([0, 0, 1], 90))]]))
        mp = [sx * .85, .44, sz * .62]
        kids.append(G.node("Motor_" + nm, cylinder(.07, .1, 36, .062), metal, t=mp))
        kids.append(G.node("Guard_" + nm, torus(.34, .016, 64, 12), carbon, t=[mp[0], .47, mp[2]]))
        kids.append(G.node("LED_" + nm, sphere(.022, 12), led if sx > 0 else ledr, t=[sx * .85, .37, sz * .62]))
        b = G.node("Rotor_" + nm, blade(.31, .07, .0), blade_m, t=[mp[0], .505, mp[2]], r=quat_axis([0, 1, 0], 30 if sz > 0 else -10))
        kids.append(b); rotor_nodes.append((b, 1 if sx * sz > 0 else -1))
    for nm, sz in (("L", 1), ("R", -1)):
        kids.append(G.node("Leg_" + nm, cylinder(.016, .62, 16), carbon, t=[0, .05, sz * .24], r=quat_axis([0, 0, 1], 90)))
        kids.append(G.node("Strut_" + nm + "F", cylinder(.014, .27, 12), carbon, t=[.17, .17, sz * .22], r=quat_axis([1, 0, 0], sz * 12)))
        kids.append(G.node("Strut_" + nm + "R", cylinder(.014, .27, 12), carbon, t=[-.17, .17, sz * .22], r=quat_axis([1, 0, 0], sz * 12)))
    kids.append(G.node("Status_LED", box(.16, .012, .02), led, t=[.3, .58, .26]))
    root = G.node("InspectionDrone", children=kids)

    # animation: rotors spin (loop)
    times = [i / 8 * .25 for i in range(9)]
    tin = G._acc(times, "f", "SCALAR", None, False)
    G.acc[tin]["min"] = [0]; G.acc[tin]["max"] = [times[-1]]
    ch, sm = [], []
    for k, (node, d) in enumerate(rotor_nodes):
        base = G.nodes[node]["rotation"]
        qs = [quat_mul(quat_axis([0, 1, 0], d * i * 45), base) for i in range(9)]
        out = G._acc(qs, "f", "VEC4")
        sm.append({"input": tin, "output": out, "interpolation": "LINEAR"})
        ch.append({"sampler": k, "target": {"node": node, "path": "rotation"}})
    G.anims.append({"name": "Rotors", "channels": ch, "samplers": sm})
    G.save(OUT, [root])
    print("OK", OUT, f"{OUT.stat().st_size/1e3:.0f} kB")


def quat_mul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz]


if __name__ == "__main__":
    build()
