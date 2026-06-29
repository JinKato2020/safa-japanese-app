# -*- coding: utf-8 -*-
# コンテンツ.xlsx → src/data/content.json
# 構造: タブ(短文/長文) ＞ カテゴリー ＞ サブテーマ ＞ items。問題形式なし・精聴/精読。
import openpyxl, json, os
SRC=r"C:/Users/jwpsa/Documents/desktop/claude/safa-japanese-app/コンテンツ.xlsx"
OUT=r"C:/Users/jwpsa/Documents/desktop/claude/safa-japanese-app/src/data/content.json"

wb=openpyxl.load_workbook(SRC, read_only=True, data_only=True)
TABS=["短文","長文"]
data={t:[] for t in TABS}

def add(tab):
    if tab not in wb.sheetnames: return
    ws=wb[tab]; rows=list(ws.iter_rows(values_only=True))
    col={h:i for i,h in enumerate(rows[0])}
    cat_index={}   # cat -> dict
    sub_index={}   # (cat,sub) -> dict
    for r in rows[1:]:
        if not r[col["ID"]]: continue
        cat=str(r[col["カテゴリー"]]).strip()
        sub=str(r[col["サブテーマ"]]).strip()
        item={
          "id":str(r[col["ID"]]).strip(),
          "title":str(r[col["タイトル"]]).strip(),
          "form":str(r[col["形式"]]).strip(),
          "level":str(r[col["対象レベル(非表示)"]]).strip(),
          "text":str(r[col["本文"]]).strip(),
          "en":str(r[col["英訳"]]).strip() if r[col["英訳"]] else "",
          "key":str(r[col["キー表現"]]).strip() if r[col["キー表現"]] else "",
          "point":str(r[col["ポイント"]]).strip() if r[col["ポイント"]] else "",
          "note":str(r[col["備考(音声)"]]).strip() if r[col["備考(音声)"]] else "",
        }
        if cat not in cat_index:
            cd={"category":cat,"subthemes":[]}; cat_index[cat]=cd; data[tab].append(cd)
        skey=(cat,sub)
        if skey not in sub_index:
            sd={"sub":sub,"items":[]}; sub_index[skey]=sd; cat_index[cat]["subthemes"].append(sd)
        sub_index[skey]["items"].append(item)

for t in TABS: add(t)
out={"tabs":TABS,"data":data}
os.makedirs(os.path.dirname(OUT),exist_ok=True)
json.dump(out, open(OUT,"w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("written",OUT, os.path.getsize(OUT),"bytes")
for t in TABS:
    n=sum(len(s["items"]) for c in data[t] for s in c["subthemes"])
    cats=[c["category"] for c in data[t]]
    print(" ",t,":",len(data[t]),"カテゴリー /",n,"本 ",cats)
