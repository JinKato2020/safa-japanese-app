# -*- coding: utf-8 -*-
# コンテンツ.xlsx → src/data/content.json（ツリー構造・新ID体系）
# 階層: タブ ＞ カテゴリー ＞ サブテーマ ＞ (区分) ＞ items。サブテーマ列に "親/子" があれば入れ子。
# ID = タブ-カテゴリー-サブテーマ-(区分)-連番。連番は末端グループ内で001〜。
import openpyxl, json, os
SRC=r"C:/Users/jwpsa/Documents/desktop/claude/safa-japanese-app/コンテンツ.xlsx"
OUT=r"C:/Users/jwpsa/Documents/desktop/claude/safa-japanese-app/src/data/content.json"

TABCODE={"短文":"S","長文":"L"}
CATCODE={"生活力":"L","使えるひとこと":"P","ことば遊び":"W","文化と本音":"C","ラジオトーク":"R","物語":"S"}
SEGCODE={
 "買い物・お金":"B","手続き":"T","しごと・学校":"W","移動":"M",
 "依頼・許可・断り":"R","お礼・謝罪":"O","気持ち・相づち":"A",
 "今日の擬音語":"G","ことわざ・慣用句":"P","カタカナ語":"K",
 "本音講座":"H","あるある":"A","食べもの":"F",
 "ニュース":"N","お便り相談室":"O","ゲストインタビュー":"I","2人のフリートーク":"F",
 "カイの物語":"K","昔話":"M","ミステリー":"Y","ドキュメンタリー":"D",
 "日本生活スタート":"L","日本一人旅":"J","カイの日常":"D","カイの休憩室":"R",
}

wb=openpyxl.load_workbook(SRC, read_only=True, data_only=True)
TABS=["短文","長文"]
data={t:[] for t in TABS}

def child(parent_list, name):
    for n in parent_list:
        if n["name"]==name: return n
    n={"name":name,"children":[]}; parent_list.append(n); return n

counters={}  # path -> count

def add(tab):
    if tab not in wb.sheetnames: return
    ws=wb[tab]; rows=list(ws.iter_rows(values_only=True))
    col={h:i for i,h in enumerate(rows[0])}
    for r in rows[1:]:
        if not r[col["ID"]]: continue
        cat=str(r[col["カテゴリー"]]).strip()
        subraw=str(r[col["サブテーマ"]]).strip()
        segs=[s for s in subraw.split("/") if s]   # サブテーマ(/区分)
        path=[cat]+segs
        # ツリーを掘る
        node=child(data[tab], cat)
        for seg in segs:
            node=child(node["children"], seg)
        node.setdefault("items", [])
        # ID生成
        codeparts=[TABCODE[tab], CATCODE.get(cat,"X")]+[SEGCODE.get(s,"X") for s in segs]
        key="-".join(codeparts)
        counters[key]=counters.get(key,0)+1
        rid="%s-%03d"%(key, counters[key])
        node["items"].append({
          "id":rid,
          "title":str(r[col["タイトル"]]).strip(),
          "form":str(r[col["形式"]]).strip(),
          "level":str(r[col["対象レベル(非表示)"]]).strip(),
          "text":str(r[col["本文"]]).strip(),
          "en":str(r[col["英訳"]]).strip() if r[col["英訳"]] else "",
          "key":str(r[col["キー表現"]]).strip() if r[col["キー表現"]] else "",
          "point":str(r[col["ポイント"]]).strip() if r[col["ポイント"]] else "",
          "note":str(r[col["備考(音声)"]]).strip() if r[col["備考(音声)"]] else "",
        })

for t in TABS: add(t)

# children が空のノードは削除(itemsのみ末端)
def prune(n):
    if n.get("children"):
        for c in n["children"]: prune(c)
        if not n["children"]: del n["children"]
for t in TABS:
    for c in data[t]: prune(c)

out={"tabs":TABS,"data":data}
os.makedirs(os.path.dirname(OUT),exist_ok=True)
json.dump(out, open(OUT,"w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("written",OUT, os.path.getsize(OUT),"bytes")
# 検証出力
def walk(n,d=0,prefix=""):
    has_items="items" in n
    print("  "*d+"・"+n["name"]+(" ["+str(len(n["items"]))+"本]" if has_items else ""))
    if has_items:
        for it in n["items"][:1]: print("  "*(d+1)+"例ID:",it["id"],it["title"])
    for c in n.get("children",[]): walk(c,d+1)
for t in TABS:
    print("["+t+"]")
    for c in data[t]: walk(c,1)
