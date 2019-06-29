/**
 * Audio Player Tag Editor
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <audioplayer@scherello.de>
 * @copyright 2019 Marcel Scherello
 */


if (!OCA.Audioplayer) {
    /**
     * @namespace
     */
    OCA.Audioplayer = {};
}

if (!OCA.Audioplayer.Editor) {
    /**
     * @namespace
     */
    OCA.Audioplayer.Editor = {};
}

/**
 * @namespace OCA.Audioplayer.Editor
 */
OCA.Audioplayer.Editor = {

    ID3EditorTabView: function () {
        var trackid = document.getElementById('app-sidebar').dataset.trackid;

        OCA.Audioplayer.Sidebar.resetView();
        document.getElementById('tabHeaderID3Editor').classList.add('selected');
        document.getElementById('ID3EditorTabView').classList.remove('hidden');
        document.getElementById('ID3EditorTabView').innerHTML = '<div style="text-align:center; word-wrap:break-word;" class="get-metadata"><p><img src="' + OC.imagePath('core', 'loading.gif') + '"><br><br></p><p>' + t('audioplayer', 'Reading data') + '</p></div>';

        $.ajax({
            type: 'GET',
            url: OC.generateUrl('apps/audioplayer/getaudioinfo'),
            data: {trackid: trackid},
            success: function (jsondata) {
                var table;
                if (jsondata.status === 'success') {

                    var edit_array = ['Title', 'Genre', 'Year', 'Artist', 'Disc', 'Track'];
                    table = document.createElement('div');
                    table.style.display = 'table';
                    table.classList.add('table');
                    var tablerow;
                    var m;
                    var count = 1;
                    var tablekey;
                    var tablevalue;

                    var audioinfo = jsondata.data;
                    for (m in audioinfo) {
                        if (edit_array.indexOf(m) !== -1) {
                            tablerow = document.createElement('div');
                            tablerow.style.display = 'table-row';
                            tablekey = document.createElement('div');
                            tablekey.classList.add('key');
                            tablekey.innerText = t('audioplayer', m);
                            tablevalue = document.createElement('div');
                            tablevalue.style.cursor = 'text';
                            tablevalue.classList.add('value');
                            tablevalue.innerText = audioinfo[m];
                            tablevalue.dataset.key = m;
                            tablevalue.dataset.trackid = trackid;
                            tablevalue.dataset.value = audioinfo[m];
                            tablevalue.addEventListener('click', OCA.Audioplayer.Editor.editId3Field.bind($this));
                            tablerow.appendChild(tablekey);
                            tablerow.appendChild(tablevalue);
                            table.appendChild(tablerow);
                            count++;
                        }
                    }
                } else {
                    table = t('audioplayer', 'No Data');
                }
                document.getElementById('ID3EditorTabView').innerHTML = '';
                document.getElementById('ID3EditorTabView').appendChild(table);
            }
        });
    },

    editId3Field: function (evt) {
        var trackid = document.getElementById('app-sidebar').dataset.trackid;
        trackKey = $(evt.target).attr('data-key');

        $('.contenteditable').each(function (i, el) {
            $(el).removeAttr('contenteditable')
                .removeClass('contenteditable')
                .text($(el).attr('data-value'))
                .click($this.editId3Field.bind($this));
        });

        $(evt.target).attr({'contenteditable': true})
            .addClass('contenteditable')
            .keypress(function (e) {
                if (e.which === 13) {
                    $this.saveId3Field(evt);
                }
            })
            .unbind("click").append('<span class="icon-checkmark"></span>');
    },

};

document.addEventListener('DOMContentLoaded', function () {
    OCA.Audioplayer.Sidebar.registerSidebarTab({
        id: 'tabHeaderID3Editor',
        class: 'ID3EditorTabView',
        tabindex: '2',
        name: t('audioplayer', 'ID3 Editor'),
        action: OCA.Audioplayer.Editor.ID3EditorTabView,
    });
});

