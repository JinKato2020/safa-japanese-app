// 辞書 = 語彙/漢字の検索・一覧。共有辞書を「URL単一ソース」で取得＋端末キャッシュ（JLPTと同一データ）。
// 取得層は submodule の dictRemote.ts（loadSharedDict / syncDictCache）。様式はまいにちJLPT BrowseScreen と同一。
// SRS習得状態は本アプリ未導入のため省略。
import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import {
  loadSharedDict,
  syncDictCache,
  type SharedDict,
  type SharedDictVocab,
  type SharedDictKanji,
} from '../../safa-shared/JLPT-Listening/dict/dictRemote';

type Kubun = 'vocab' | 'kanji';
const KUBUN: { key: Kubun; label: string }[] = [
  { key: 'vocab', label: '単語' },
  { key: 'kanji', label: '漢字' },
];
const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

type Row =
  | { kind: 'vocab'; id: string; v: SharedDictVocab }
  | { kind: 'kanji'; id: string; k: SharedDictKanji };

export default function DictScreen() {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);

  const [dict, setDict] = useState<SharedDict | null>(null);
  const [error, setError] = useState(false);
  const [kubun, setKubun] = useState<Kubun>('vocab');
  const [level, setLevel] = useState<string>('all'); // 'all' または N5..N1(単語のみ)
  const [query, setQuery] = useState('');

  // 起動時: 配信元(GitHub Pages)の更新確認→キャッシュ→一括ロード。初回のみ通信、以後オフライン可。
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await syncDictCache();
        const d = await loadSharedDict();
        if (alive) setDict(d);
      } catch {
        if (alive) setError(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const VOCAB = dict?.vocab ?? [];
  const KANJI = dict?.kanji ?? [];
  const EXAMPLES = dict?.examples ?? {};

  // 区分に存在するレベル(単語のみ)。漢字は級分類が無いので「全」のみ。
  const availLevels = useMemo(
    () => (kubun === 'vocab' ? LEVEL_ORDER.filter((l) => VOCAB.some((v) => v.level === l)) : []),
    [kubun, VOCAB],
  );
  const effLevel = level === 'all' || availLevels.includes(level) ? level : 'all';

  const results = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    if (kubun === 'vocab') {
      let list =
        effLevel === 'all'
          ? [...VOCAB].sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level))
          : VOCAB.filter((v) => v.level === effLevel);
      if (q) {
        list = list.filter((v) =>
          `${v.word} ${v.reading} ${v.gloss ?? ''} ${(v.senses ?? []).join(' ')}`.toLowerCase().includes(q),
        );
      }
      return list.map((v) => ({ kind: 'vocab', id: `${v.word}|${v.reading}`, v }));
    }
    // 漢字: 頻度順(freq小=高頻度)
    let list = [...KANJI].sort((a, b) => (a.freq ?? 9999) - (b.freq ?? 9999));
    if (q) {
      list = list.filter((k) =>
        `${k.char} ${(k.on ?? []).join(' ')} ${(k.kun ?? []).join(' ')} ${(k.meanings ?? []).join(' ')}`.toLowerCase().includes(q),
      );
    }
    return list.map((k) => ({ kind: 'kanji', id: k.char, k }));
  }, [kubun, effLevel, query, VOCAB, KANJI]);

  const renderItem = ({ item }: { item: Row }) => {
    if (item.kind === 'vocab') {
      const v = item.v;
      const ex = EXAMPLES[`${v.word}|${v.reading}`];
      return (
        <View style={s.row}>
          <View style={s.rowMain}>
            <Text style={s.term}>{v.word}　<Text style={s.reading}>{v.reading}</Text></Text>
            <Text style={s.meaning}>{v.gloss}</Text>
            {ex ? (
              <>
                <Text style={s.example}>{ex.ja}</Text>
                {ex.en ? <Text style={s.exampleEn}>{ex.en}</Text> : null}
              </>
            ) : null}
          </View>
          <Text style={s.levelBadge}>{v.level}</Text>
        </View>
      );
    }
    const k = item.k;
    const reading = [(k.on ?? []).length ? `音 ${(k.on ?? []).join('・')}` : '', (k.kun ?? []).length ? `訓 ${(k.kun ?? []).join('・')}` : '']
      .filter(Boolean)
      .join('　');
    return (
      <View style={s.row}>
        <View style={s.rowMain}>
          <Text style={s.term}>{k.char}　<Text style={s.reading}>{reading}</Text></Text>
          <Text style={s.meaning}>{(k.meanings ?? []).join(', ')}</Text>
          <Text style={s.exampleEn}>
            {[k.grade ? `小${k.grade}` : '', k.strokes ? `${k.strokes}画` : ''].filter(Boolean).join('　')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.top}>
        <Text style={s.tab}>辞書</Text>
        <TextInput
          style={s.search}
          value={query}
          onChangeText={setQuery}
          placeholder="語・読み・意味で検索"
          placeholderTextColor={c.faint}
          autoCorrect={false}
          editable={!!dict}
        />
      </View>

      <View style={s.filters}>
        {KUBUN.map((k) => (
          <Pressable key={k.key} onPress={() => setKubun(k.key)} style={[s.chip, kubun === k.key && s.chipOn]}>
            <Text style={[s.chipTxt, kubun === k.key && s.chipTxtOn]}>{k.label}</Text>
          </Pressable>
        ))}
      </View>

      {availLevels.length ? (
        <View style={[s.filters, s.filters2]}>
          <Pressable onPress={() => setLevel('all')} style={[s.chip, effLevel === 'all' && s.chipOn]}>
            <Text style={[s.chipTxt, effLevel === 'all' && s.chipTxtOn]}>全</Text>
          </Pressable>
          {availLevels.map((l) => (
            <Pressable key={l} onPress={() => setLevel(l)} style={[s.chip, effLevel === l && s.chipOn]}>
              <Text style={[s.chipTxt, effLevel === l && s.chipTxtOn]}>{l}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {!dict ? (
        <View style={s.center}>
          {error ? (
            <Text style={s.empty}>辞書を取得できませんでした（オフラインの可能性）。{'\n'}通信できる状態でもう一度開いてください。</Text>
          ) : (
            <>
              <ActivityIndicator color={c.blue} />
              <Text style={s.loadingTxt}>辞書を読み込み中…（初回のみ通信）</Text>
            </>
          )}
        </View>
      ) : (
        <>
          <Text style={s.count}>{results.length} 件</Text>
          <FlatList
            data={results}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            initialNumToRender={20}
            contentContainerStyle={s.listBody}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={s.empty}>該当なし</Text>}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
    tab: { fontSize: ty.small, fontWeight: '700', letterSpacing: 1, color: c.mute },
    search: {
      flex: 1, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.line,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: ty.body, color: c.ink,
    },
    filters: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, flexWrap: 'wrap' },
    filters2: { marginTop: spacing.sm },
    chip: {
      paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.pill,
      borderWidth: 1, borderColor: c.line, backgroundColor: c.surface,
    },
    chipOn: { borderColor: c.blue, backgroundColor: c.blueLight },
    chipTxt: { fontSize: ty.small, color: c.ink2, fontWeight: '600' },
    chipTxtOn: { color: c.blueDark, fontWeight: '800' },
    count: { fontSize: ty.tiny, color: c.faint, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    listBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    row: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.md,
      borderWidth: 1, borderColor: c.line, padding: spacing.md, marginTop: spacing.sm, gap: spacing.sm,
    },
    rowMain: { flex: 1, gap: 2 },
    term: { fontSize: ty.h2, fontWeight: '800', color: c.ink },
    reading: { fontSize: ty.small, fontWeight: '600', color: c.mute },
    meaning: { fontSize: ty.small, color: c.ink2 },
    example: { fontSize: ty.body, color: c.ink, lineHeight: 24, marginTop: spacing.xs },
    exampleEn: { fontSize: ty.tiny, color: c.faint, fontStyle: 'italic', marginTop: 2 },
    levelBadge: { fontSize: 10, fontWeight: '800', color: c.mute, alignSelf: 'flex-start' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
    loadingTxt: { fontSize: ty.small, color: c.mute },
    empty: { fontSize: ty.body, color: c.faint, textAlign: 'center', marginTop: spacing.xl, lineHeight: 22 },
  });
