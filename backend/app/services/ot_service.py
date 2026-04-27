from typing import List, Dict, Any, Union, Tuple
import json

Op = List[Dict[str, Union[int, str]]]
"""OT Operation: [{'retain': 5}, {'delete': 2}, {'insert': 'hi'}]"""

def transform(op1: Op, op2: Op, side: str = 'left') -> Tuple[Op, Op]:
    """
    Transform two concurrent ops. Returns (transformed_op1, transformed_op2)
    side='left' means op1 happened first (server transform perspective).
    """
    i1, i2 = 0, 0
    new_op1: Op = []
    new_op2: Op = []

    while i1 < len(op1) and i2 < len(op2):
        o1 = op1[i1]
        o2 = op2[i2]

        if 'retain' in o1 and 'retain' in o2:
            r = min(o1['retain'], o2['retain'])
            if side == 'left':
                new_op1.append({'retain': r})
                new_op2.append({'retain': o2['retain'] - r})
            else:
                new_op1.append({'retain': o1['retain'] - r})
                new_op2.append({'retain': r})
            if o1['retain'] > o2['retain']:
                i1 += 1
                new_op1[-1]['retain'] += o1['retain'] - r
            elif o1['retain'] < o2['retain']:
                i2 += 1
                new_op2[-1]['retain'] += o2['retain'] - r
            else:
                i1 += 1
                i2 += 1
            continue

        if 'delete' in o1 and 'retain' in o2:
            r = min(o1['delete'], o2['retain'])
            new_op1.append({'delete': r})
            new_op2.append({'retain': r})
            i1 += 1 if o1['delete'] == r else 0
            i2 += 1 if o2['retain'] == r else 0
            continue

        if 'retain' in o1 and 'delete' in o2:
            r = min(o1['retain'], o2['delete'])
            new_op1.append({'retain': r})
            new_op2.append({'delete': r})
            i1 += 1 if o1['retain'] == r else 0
            i2 += 1 if o2['delete'] == r else 0
            continue

        if 'delete' in o1 and 'delete' in o2:
            r = min(o1['delete'], o2['delete'])
            new_op1.append({'delete': r})
            new_op2.append({'delete': r})
            i1 += 1 if o1['delete'] == r else 0
            i2 += 1 if o2['delete'] == r else 0
            continue

        if 'insert' in o1:
            new_op1.append(o1.copy())
            i1 += 1
            continue

        if 'insert' in o2:
            new_op2.append(o2.copy())
            i2 += 1
            continue

    new_op1 += op1[i1:]
    new_op2 += op2[i2:]

    return new_op1, new_op2

def compose(base: Op, op: Op) -> Op:
    """Compose op onto base document."""
    result: Op = []
    i = 0  

    for component in op:
        if 'retain' in component:
            result.append({'retain': component['retain']})
            i += component['retain']
        elif 'delete' in component:
            result.append({'delete': component['delete']})
        elif 'insert' in component:
            result.append({'insert': component['insert']})

    return result

def apply(doc: str, op: Op) -> str:
    """Apply op to document string."""
    result = []
    i = 0

    for component in op:
        if 'retain' in component:
            result.append(doc[i:i + component['retain']])
            i += component['retain']
        elif 'insert' in component:
            result.append(component['insert'])
        elif 'delete' in component:
            i += component['delete']

    result.append(doc[i:])
    return ''.join(result)

def op_to_json(op: Op) -> str:
    """Serialize OT op for WebSocket."""
    return json.dumps(op)

def json_to_op(s: str) -> Op:
    """Deserialize OT op."""
    return json.loads(s)


def legacy_transform(prev_op: dict, new_op: dict) -> dict:
    """Wrapper for old string-based ops."""
    
    def dict_to_ot(op_dict: dict) -> Op:
        op: Op = []
        pos = op_dict.get('position', 0)
        if pos > 0:
            op.append({'retain': pos})
        
        op_type = op_dict.get('operation')
        if op_type == 'insert':
            op.append({'insert': op_dict.get('value', '')})
        elif op_type == 'delete':
            op.append({'delete': op_dict.get('length', 1)})
        elif op_type == 'replace':
            op.append({'delete': len(op_dict.get('value', ''))})
            op.append({'insert': op_dict.get('value', '')})
        
        return op

    op1 = dict_to_ot(prev_op)
    op2 = dict_to_ot(new_op)
    
    t_op2, _ = transform(op1, op2, 'left')
    

    pos = 0
    for c in t_op2:
        if 'retain' in c:
            pos += c['retain']
        elif 'insert' in c:
            return {'operation': 'insert', 'position': pos, 'value': c['insert']}
        elif 'delete' in c:
            return {'operation': 'delete', 'position': pos, 'length': c['delete']}
    
