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

    APEditorTabView: function () {
        var trackid = $("#app-sidebar").data('trackid');

        $('#tabHeaderAudiplayer').removeClass('selected');
        $('#tabHeaderID3Editor').addClass('selected');
        $('#audioplayerTabView').addClass('hidden');
        $('#ID3EditorTabView').removeClass('hidden').html('<div style="text-align:center; word-wrap:break-word;" class="get-metadata"><p><img src="' + OC.imagePath('core', 'loading.gif') + '"><br><br></p><p>' + t('audioplayer', 'Reading data') + '</p></div>');

        $.ajax({
            type: 'GET',
            url: OC.generateUrl('apps/audioplayer/getaudioinfo'),
            data: {trackid: trackid},
            success: function (jsondata) {
                var html;
                if (jsondata.status === 'success') {

                    var edit_array = ['Title', 'Genre', 'Year', 'Artist', 'Disc', 'Track'];
                    var table = $('<div>').css('display', 'table').addClass('table');
                    var tablerow;
                    var m;
                    var count = 1;
                    var tablekey;
                    var tablevalue;

                    var audioinfo = jsondata.data;
                    for (m in audioinfo) {
                        tablerow = $('<div>').css('display', 'table-row');
                        tablekey = $('<div>').addClass('key').text(t('audioplayer', m));
                        tablevalue = $('<div>').css({'cursor': 'text'})
                            .addClass('value')
                            .text(audioinfo[m]);
                        if (jQuery.inArray(m, edit_array) !== -1) {
                            tablevalue.attr({'data-key': m, 'data-trackid': trackid, 'data-value': audioinfo[m]})
                                .click(OCA.Audioplayer.Editor.editId3Field.bind($this));
                        }
                        tablerow.append(tablekey).append(tablevalue);
                        table.append(tablerow);
                        count++;
                    }
                    $('#sidebarTitle').html(jsondata.data['Title']);
                    $('#sidebarMime').html(jsondata.data['MIME type']);

                } else {
                    html = t('audioplayer', 'No Data');
                }

                $('#ID3EditorTabView').html(table);
            }
        });
    },

    editId3Field: function(evt){
        trackId = $(evt.target).attr('data-trackid');
        trackKey = $(evt.target).attr('data-key');
        //alert(trackId+trackId);

        $('.contenteditable').each(function (i, el) {
            $(el).removeAttr('contenteditable')
                .removeClass('contenteditable')
                .text($(el).attr('data-value'))
                .click($this.editId3Field.bind($this));
        });

        $(evt.target).attr({'contenteditable': true})
            .addClass('contenteditable')
            .keypress(function(e){ if(e.which === 13) {
                $this.saveId3Field(evt);
            } })
            .unbind("click").append('<span class="icon-checkmark"></span>');
    },

};

$(document).ready(function () {
    OCA.Audioplayer.Sidebar.registerSidebarTab({
        id: 'tabHeaderID3Editor',
        class: 'ID3EditorTabView',
        tabindex: '2',
        name: t('audioplayer', 'ID3 Editor'),
        action: OCA.Audioplayer.Editor.APEditorTabView,
    });
});

