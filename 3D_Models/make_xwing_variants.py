"""Reproduce the two edits from the unmodified, attributed Sketchfab GLB.

Python standard library only; run in any directory. No textures are re-encoded.
Selections refer to mesh 0 triangle numbers in the supplied original.
"""
from pathlib import Path
import copy
import hashlib
import json
import math
import struct

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'stylized_x-_wing.glb'
SELECTIONS = json.loads((ROOT / 'xwing-edit-selections.json').read_text())

def unpack(path):
    raw = path.read_bytes()
    magic, version, total = struct.unpack_from('<III', raw)
    assert magic == 0x46546c67 and version == 2 and total == len(raw)
    length, kind = struct.unpack_from('<II', raw, 12)
    assert kind == 0x4e4f534a
    doc = json.loads(raw[20:20+length])
    offset = 20+length
    n, kind = struct.unpack_from('<II', raw, offset)
    assert kind == 0x004e4942
    return doc, bytearray(raw[offset+8:offset+8+n])

def accessor(doc, blob, index):
    a = doc['accessors'][index]
    v = doc['bufferViews'][a['bufferView']]
    fmt = {5121:'B',5123:'H',5125:'I',5126:'f'}[a['componentType']]
    size = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
    stride = v.get('byteStride',struct.calcsize(fmt)*size)
    offset = v.get('byteOffset',0)+a.get('byteOffset',0)
    return [struct.unpack_from('<'+fmt*size,blob,offset+i*stride) for i in range(a['count'])]

def add_accessor(doc, blob, values, component, typ, target):
    while len(blob)%4: blob.append(0)
    fmt = {5125:'I',5126:'f'}[component]
    payload = struct.pack('<'+fmt*sum(len(v) for v in values),*[x for v in values for x in v])
    vi = len(doc['bufferViews'])
    doc['bufferViews'].append({'buffer':0,'byteOffset':len(blob),'byteLength':len(payload),'target':target})
    blob.extend(payload)
    a = {'bufferView':vi,'componentType':component,'count':len(values),'type':typ}
    a['min'] = [min(v[j] for v in values) for j in range(len(values[0]))]
    a['max'] = [max(v[j] for v in values) for j in range(len(values[0]))]
    ai = len(doc['accessors']);doc['accessors'].append(a)
    return ai

def add_node(doc, node, parent):
    index = len(doc['nodes']);doc['nodes'].append(node)
    doc['nodes'][parent].setdefault('children',[]).append(index)
    return index

def add_cabin(doc, blob):
    """Small empty cockpit insert beneath the separated, unchanged canopy."""
    def material(name,color):
        i=len(doc['materials'])
        doc['materials'].append({'name':name,'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':color+[1],'metallicFactor':0,'roughnessFactor':.86}})
        return i
    liner=material('Cockpit dark lining',[.018,.023,.03])
    seat=material('Empty seat graphite',[.07,.083,.105])
    pad=material('Seat cushion',[.033,.041,.057])
    dashboard=material('Dashboard',[.055,.068,.078])
    def mesh(name,vertices,faces,mat):
        # Flat normals preserve the original low-poly style.
        pos=[];norm=[]
        for face in faces:
            for j in range(1,len(face)-1):
                a,b,c=[vertices[k] for k in [face[0],face[j],face[j+1]]]
                u=[b[k]-a[k] for k in range(3)];v=[c[k]-a[k] for k in range(3)]
                n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
                d=math.sqrt(sum(x*x for x in n));n=[x/d for x in n]
                pos.extend([a,b,c]);norm.extend([n]*3)
        mi=len(doc['meshes'])
        doc['meshes'].append({'name':name,'primitives':[{'attributes':{'POSITION':add_accessor(doc,blob,pos,5126,'VEC3',34962),'NORMAL':add_accessor(doc,blob,norm,5126,'VEC3',34962)},'material':mat,'mode':4}]})
        add_node(doc,{'name':name,'mesh':mi},3)
    def box(name,low,high,mat):
        x,y,z=low;X,Y,Z=high
        mesh(name,[(x,y,z),(X,y,z),(X,Y,z),(x,Y,z),(x,y,Z),(X,y,Z),(X,Y,Z),(x,Y,Z)],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat)
    ring=[[-.70194,-7.57583,1.10596],[0,-7.57583,1.10596],[.70194,-7.57583,1.10596],[.85149,-7.56387,1.02387],[1.12086,-4.59978,.8209],[.93237,-3.67591,1.27831],[0,-3.67591,1.27831],[-.93237,-3.67591,1.27831],[-1.12086,-4.59978,.8209],[-.85149,-7.56387,1.02387]]
    upper=[[x*.994,y,z-.018] for x,y,z in ring]
    lower=[[x*.77,-5.45+(y+5.45)*.92,-.64] for x,y,z in ring]
    mesh('COCKPIT_LINER',upper+lower,[(i,(i+1)%10,(i+1)%10+10,i+10) for i in range(10)]+[tuple(range(19,9,-1))],liner)
    box('EMPTY_SEAT_BASE',[-.5,-5.35,-.57],[.5,-4.3,-.2],seat)
    box('EMPTY_SEAT_CUSHION',[-.43,-5.27,-.21],[.43,-4.36,-.09],pad)
    back=[[-.5,-4.52,-.4],[.5,-4.52,-.4],[.5,-4.2,.92],[-.5,-4.2,.92],[-.5,-4.34,-.4],[.5,-4.34,-.4],[.5,-4.02,.92],[-.5,-4.02,.92]]
    mesh('EMPTY_SEAT_BACK',back,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(3,2,6,7),(0,3,7,4),(1,5,6,2)],seat)
    box('COCKPIT_DASHBOARD',[-.59,-7.32,.47],[.59,-6.88,.73],dashboard)

def save(doc, blob, name):
    doc['buffers'][0]['byteLength'] = len(blob)
    while len(blob)%4: blob.append(0)
    data = json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode('utf-8')
    data += b' '*((-len(data))%4)
    raw = struct.pack('<III',0x46546c67,2,28+len(data)+len(blob))
    raw += struct.pack('<II',len(data),0x4e4f534a)+data
    raw += struct.pack('<II',len(blob),0x004e4942)+blob
    (ROOT/name).write_bytes(raw)
    print(name,len(raw),'bytes')

def build(open_cockpit):
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == "583fe46fe87dd5806369c803e4bf825adcfaa40a4b49c0ace25ad3a3c4074b4f", "Use the untouched original GLB that came with this kit."
    doc,blob = unpack(SOURCE)
    original = copy.deepcopy(doc['meshes'][0]['primitives'][0])
    indices = [v[0] for v in accessor(doc,blob,original['indices'])]
    triangles = [indices[i:i+3] for i in range(0,len(indices),3)]
    canopy = set(SELECTIONS['canopy_triangles'])
    r2 = set(SELECTIONS['r2_triangles'])
    assert len(canopy)==124 and len(r2)==154 and not canopy.intersection(r2)

    def primitive(ts):
        p = copy.deepcopy(original)
        p['indices'] = add_accessor(doc,blob,[(x,) for i in ts for x in triangles[i]],5125,'SCALAR',34963)
        return p

    removed = canopy|r2 if open_cockpit else r2
    doc['meshes'][0]['primitives'][0] = primitive(i for i in range(len(triangles)) if i not in removed)
    if open_cockpit:
        hinge = SELECTIONS['canopy_hinge']
        angle = math.radians(SELECTIONS['canopy_angle_degrees'])
        pivot = add_node(doc,{'name':'XWING_CANOPY_PIVOT','translation':hinge,'rotation':[math.sin(angle/2),0,0,math.cos(angle/2)],'extras':{'closedRotationQuaternion':[0,0,0,1],'openAngleDegrees':-55,'hingeAxis':'local X'}},3)
        canopy_mesh = len(doc['meshes'])
        doc['meshes'].append({'name':'Original canopy shell','primitives':[primitive(sorted(canopy))]})
        add_node(doc,{'name':'XWING_CANOPY','mesh':canopy_mesh,'translation':[-x for x in hinge]},pivot)
        r2_center = [0,-2.843005,1.327547]
        r2_pivot = add_node(doc,{'name':'R2_HEAD','translation':r2_center,'extras':{'yawAxis':'local Z','description':'Original exposed astromech dome; retained geometry and texture'}},3)
        r2_mesh = len(doc['meshes'])
        doc['meshes'].append({'name':'Original R2 dome','primitives':[primitive(sorted(r2))]})
        add_node(doc,{'name':'R2_DOME_MESH','mesh':r2_mesh,'translation':[-x for x in r2_center]},r2_pivot)
        add_node(doc,{'name':'R2_NOTE_ORIGIN','translation':[0,0,.78]},r2_pivot)
        add_cabin(doc,blob)
    mods = 'Canopy separated and hinged open 55 degrees; original R2 dome separated for interaction; heart launch anchor and a simple empty cockpit liner, seat and dashboard added.' if open_cockpit else 'R2 dome removed; original cockpit remains closed; original socket retained.'
    doc['asset']['extras']['modifications'] = mods
    doc['asset']['extras']['modifiedFor'] = 'Ms. Daire get-well website kit'
    doc['asset']['generator'] += '; GLB geometry edits for Ms. Daire kit'
    save(doc,blob,'stylized_x-_wing_open_cockpit.glb' if open_cockpit else 'stylized_x-_wing_without_r2d2.glb')

if __name__ == '__main__':
    build(True)
    build(False)
