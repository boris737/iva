"""Make a built Astro site (dist/) work from any sub-path, e.g. GitHub Pages at /iva/.
Every root-absolute URL becomes relative to its page; scripts read window.__root for runtime URLs."""
import re, pathlib, sys
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'dist')
for f in out.rglob('*.html'):
    d = len(f.relative_to(out).parts) - 1; pre = '../' * d or './'
    s = f.read_text()
    s = re.sub(r'(?<=[\s="\',(])/(?=[_a-zA-Z#]|"|$)', pre, s)
    for k in ['./', '../', '../../', '../../../']: s = s.replace(f'="{k}"', f'="{k}index.html"')
    s = re.sub(r'(href="[^"#:]*?/)(#[^"]*)?"', lambda m: m.group(1) + 'index.html' + (m.group(2) or '') + '"', s)
    s = re.sub(r'href="(\.\.?/)#', r'href="\1index.html#', s)
    s = s.replace('<head>', f'<head><script>window.__root="{pre}"</script>', 1)
    if f.relative_to(out).as_posix() in ('index.html', 'mk/index.html'):
        s = re.sub(r'url\((?:\.\./)*\.?/?_astro/', 'url(./', s)   # resolved against the stylesheet in _astro/
    f.write_text(s)
for f in list(out.rglob('_astro/*.css')) + list(out.rglob('_astro/*.js')):
    s = f.read_text()
    s = s.replace('url(/_astro/', 'url(./').replace('`/seq/', '`${window.__root||"/"}seq/').replace('return"/"+l}', 'return(window.__root||"/")+l}')
    f.write_text(s)
print('relativized', out)
