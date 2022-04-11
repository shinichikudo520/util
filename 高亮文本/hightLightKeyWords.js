import $ from 'jquery';

function hightLightKeyWords($el, kw) {
    if (!kw) return;

    try {
        kw = decodeURIComponent(kw)
    } catch (ex) {
        console.error(ex);
        return;
    }

    kw = kw.split(' ');
    kw.forEach((str) => {
        str = str.trim();
        // 关键词中不允许存在指定的特殊字符
        if (!str || str.indexOf('^') > -1 || str.indexOf('|') > -1) return console.log('禁止高亮程序占用字符');

        str = str
            .replace(/\./g, '\\.')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/-/g, '\\-')
            .replace(/\+/g, '\\+')
            .replace(/\?/g, '\\?')
            .replace(/\*/g, '\\*');

        const reg = new RegExp(str, 'gi');
        $el.each(function() {
            const $is = $(this).find('i');
            const iContainers = []
            if ($is.length) {
                $is.each(function(i, $i) {
                    iContainers.push($i.outerHTML);
                });
            }

            let text = $(this).html();
            if ($is.length) {
                iContainers.forEach(function(item) {
                    text = text.replace(item, '^|^'); // 把已经高亮的剔除，暂时用特殊符号'^|^'替换
                })
            }


            const matched = text.match(reg);
            if (matched) {
                text = text.replace(reg, '<i class="hightLight">' + matched[0] + '</i>');
                if ($is.length) {
                    iContainers.forEach(function(item) {
                        text = text.replace('^|^', item);
                    })
                }
                $(this).html(text);
            }
        });
    });
}
const btn = $('.btn');
btn.on('click', function() {
    const kw = $('.keywordInput').val();
    console.log('keyword...', kw);
    hightLightKeyWords($('ul li'), kw);

})