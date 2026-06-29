# -*- coding: utf-8 -*-
# コンテンツ.xlsx → src/data/content.json（短文タブ用・精聴/精読・問題なし）
# カテゴリー(生活力向上/日本文化/1分リスニング) ＞ 場面(分野) ＞ タイトル(items)
import openpyxl, json, os
SRC=r"C:/Users/jwpsa/Documents/desktop/claude/safa-japanese-app/コンテンツ.xlsx"
OUT=r"C:/Users/jwpsa/Documents/desktop/claude/safa-japanese-app/src/data/content.json"

wb=openpyxl.load_workbook(SRC, read_only=True, data_only=True)
CATS=["生活力向上","日本文化","1分リスニング"]
data={c:[] for c in CATS}
group_index={}  # (cat, group) -> dict

def add(cat, sheet):
    if sheet not in wb.sheetnames: return
    ws=wb[sheet]; rows=list(ws.iter_rows(values_only=True))
    hdr=rows[0]
    col={h:i for i,h in enumerate(hdr)}
    for r in rows[1:]:
        if not r[col["ID"]]: continue
        g=str(r[col["場面"]]).strip()
        item={
          "id":str(r[col["ID"]]).strip(),
          "title":str(r[col["タイトル"]]).strip(),
          "form":str(r[col["形式"]]).strip(),
          "level":str(r[col["対象レベル(非表示)"]]).strip(),
          "text":str(r[col["本文"]]).strip(),
          "en":str(r[col["英訳"]]).strip() if r[col["英訳"]] else "",
          "key":str(r[col["キー表現"]]).strip() if r[col["キー表現"]] else "",
          "practical":str(r[col["実用ポイント"]]).strip() if r[col["実用ポイント"]] else "",
          "note":str(r[col["備考(音声)"]]).strip() if r[col["備考(音声)"]] else "",
        }
        key=(cat,g)
        if key not in group_index:
            gd={"group":g,"items":[]}; group_index[key]=gd; data[cat].append(gd)
        group_index[key]["items"].append(item)

add("生活力向上","生活力向上")
add("1分リスニング","1分リスニング")
# 日本文化 は今後（空）

out={"categoryOrder":CATS,"data":data}
os.makedirs(os.path.dirname(OUT),exist_ok=True)
json.dump(out, open(OUT,"w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("written",OUT, os.path.getsize(OUT),"bytes")
for c in CATS:
    n=sum(len(g["items"]) for g in data[c]); print(" ",c,":",len(data[c]),"分野/",n,"本")
