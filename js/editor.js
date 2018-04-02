/**
 * Audio Player Tag Editor
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <audioplayer@scherello.de>
 * @copyright 2018 Marcel Scherello
 */

Audios.prototype.APEditorTabView = function () {
    var trackid = $("#app-sidebar").data('trackid');

    $('#tabHeaderAudiplayer').removeClass('selected');
    $('#tabHeaderID3Editor').addClass('selected');
    $('#audioplayerTabView').addClass('hidden');
    $('#ID3EditorTabView').removeClass('hidden').html('<div style="text-align:center; word-wrap:break-word;" class="get-metadata"><p><img src="'+OC.imagePath('core','loading.gif')+'"><br><br></p><p>'+t('audioplayer', 'Reading data')+'</p></div>');

    $.ajax({
        type : 'GET',
        url : OC.generateUrl('apps/audioplayer/getaudioinfo'),
        data : {trackid: trackid},
        success : function(jsondata) {
            var html;
            if(jsondata.status === 'success'){

                var edit_array = ['Title', 'Genre', 'Year', 'Artist', 'Disc', 'Track'];
                var table = $('<div>').css('display', 'table').addClass('table');
                var tablerow;
                var m;
                var count = 1;
                var tablekey;
                var tablevalue;

                var audioinfo = jsondata.data;
                for (m in audioinfo) {
                    tablerow =  $('<div>').css('display', 'table-row');
                    tablekey = $('<div>').addClass('key').text(t('audioplayer',m));
                    tablevalue = $('<div>').css({'cursor': 'text'})
                        .addClass('value')
                        .text(audioinfo[m]);
                    if(jQuery.inArray(m, edit_array) !== -1) {
                        tablevalue.attr({'data-key': m, 'data-trackid': trackid, 'data-value': audioinfo[m]})
                            .click($this.editId3Field.bind($this));
                    }
                    tablerow.append(tablekey).append(tablevalue);
                    table.append(tablerow);
                    count++;
                }
                $('#sidebarTitle').html(jsondata.data[ 'Title' ]);
                $('#sidebarMime').html(jsondata.data[ 'MIME type' ]);

            } else{
                html = t('audioplayer','No Data');
            }

            $('#ID3EditorTabView').html(table);
        }
    });

};

Audios.prototype.editId3Field = function(evt){
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
};

Audios.prototype.saveId3Field = function(evt){
    var trackId = $(evt.target).attr('data-trackid');
    var editKey = $(evt.target).attr('data-key');
    var editValue = $(evt.target).text();
    $(evt.target).attr({'data-value': editValue});

    $.ajax({
        type: 'POST',
        url: OC.generateUrl('apps/audioplayer_editor/savemetadata'),
        data: {'track_id': trackId,
            'editKey': editKey,
            'editValue': editValue
        },
        success: function (ajax_data) {
        }
    });

    $('.contenteditable').each(function (i, el) {
        $(el).removeAttr('contenteditable')
            .removeClass('contenteditable')
            .text($(el).attr('data-value'))
            .click($this.editId3Field.bind($this));
    });
};

Audios.prototype.editSong = function(evt){

    this.initPhotoDialog();
    var songId;
    var fileId;
    if($(evt.target).attr('data-fileid')){
        songId = $(evt.target).attr('data-trackid');
        fileId = $(evt.target).attr('data-fileid');
    }else{
        songId = $(evt).attr('data-id');
        fileId = $(evt).attr('data-fileid');
    }
    $this = this;
    $.getJSON(OC.generateUrl('apps/audioplayer/editaudiofile'), {
        songFileId: fileId
    },function(jsondata){
        if(jsondata.status === 'success'){

            var posterImg='<div id="noimage">'+t('audioplayer', 'Drag picture here!')+'</div>';

            if(jsondata.data.isPhoto === '1'){

                $this.imgSrc = jsondata.data.poster;
                $this.imgMimeType = jsondata.data.mimeType;
                posterImg = '';
                $this.loadPhoto();
            }

            var posterAction='<span class="labelPhoto" id="pinPhoto">'+posterImg+
                '<div class="tip" id="pin_details_photo_wrapper" title="'+t('audioplayer','Drop picture')+'" data-element="PHOTO">'+
                '<ul id="phototools" class="transparent hidden">'+
                '<li><a class="delete" title="'+t('audioplayer','Delete')+'"><img style="height:26px;" class="svg" src="'+OC.imagePath('core', 'actions/delete.svg')+'"></a></li>'+
                '<li><a class="edit" title="'+t('audioplayer','Edit')+'"><img style="height:26px;" class="svg" src="'+OC.imagePath('core', 'actions/rename.svg')+'"></a></li>'+
                '<li><a class="svg upload" title="'+t('audioplayer','Upload')+'"><img style="height:26px;" class="svg" src="'+OC.imagePath('core', 'actions/upload.svg')+'"></a></li>'+
                '<li><a class="svg cloud" title="'+t('audioplayer','Select from cloud')+'"><img style="height:26px;" class="svg" src="'+OC.imagePath('core', 'actions/public.svg')+'"></a></li>'+
                '</ul></div>'+
                '<iframe name="file_upload_target" id="file_upload_target" src=""></iframe></span>';

            html = $('<div/>').html(
                '<input type="hidden" name="isphoto" id="isphoto" value="'+jsondata.data.isPhoto+'" />'+
                '<input type="hidden" name="id" id="photoId" value="'+fileId+'" />'+
                '<input type="hidden" name="tmpkey" id="tmpkey" value="'+jsondata.data.tmpkey+'" />'+
                '<textarea id="imgsrc" name="imgsrc" style="display:none;">'+jsondata.data.poster+'</textarea>'+
                '<input type="hidden" name="imgmimetype" id="imgmimetype" value="'+jsondata.data.mimeType+'" />'	+
                '<div class="edit-left"><label class="editDescr">'+t('audioplayer','Title')+'</label> <input type="text" placeholder="'+t('audioplayer','Title')+'" id="sTitle" style="width:45%;" value="' + jsondata.data.title + '" /><br />' +
                '<label class="editDescr">'+t('audioplayer','File')+'</label> <input type="text" placeholder="'+t('audioplayer','File')+'"  style="width:45%;" value="' + jsondata.data.localPath + '" readonly /><br />' +
                '<label class="editDescr">'+t('audioplayer','Track')+'</label> <input type="text" placeholder="'+t('audioplayer','Track')+'" id="sTrack" maxlength="2" style="width:10%;" value="' + jsondata.data.track + '" /> '+t('audioplayer','of')+' <input type="text" placeholder="'+t('audioplayer','Total')+'" id="sTracktotal" maxlength="2" style="width:10%;" value="' + jsondata.data.tracktotal + '" /><br />'+

                '<label class="editDescr">'+t('audioplayer','Existing Artists')+'</label><select style="width:45%;" id="eArtist"></select>' +
                '<label class="editDescr">'+t('audioplayer','New Artist')+'</label> <input type="text" placeholder="'+t('audioplayer','Artist')+'" id="sArtist" style="width:45%;" value="" />' +
                '<label class="editDescr">'+t('audioplayer','Existing Albums')+'</label><select style="width:45%;" id="eAlbum"></select>' +
                '<label class="editDescr">'+t('audioplayer','New Album')+'</label> <input type="text" placeholder="'+t('audioplayer','Album')+'" id="sAlbum" style="width:45%;" value="" />' +
                '<label class="editDescr">'+t('audioplayer','Existing Genres')+'</label><select style="width:45%;" id="eGenre"></select>' +
                '<label class="editDescr">'+t('audioplayer','New Genre')+'</label> <input type="text" placeholder="'+t('audioplayer','Genre')+'" id="sGenre" style="width:45%;" value="" />' +
                '<label class="editDescr">'+t('audioplayer','Year')+'</label> <input type="text" placeholder="'+t('audioplayer','Year')+'" id="sYear" maxlength="4" style="width:15%;" value="' + jsondata.data.year + '" /><br />' +
                '<label class="editDescr">'+t('audioplayer','Composer')+'</label> <input type="text" disabled style="width:45%;" value="'+jsondata.data.composer+'" />' +
                '<label class="editDescr">'+t('audioplayer','Subtitle')+'</label> <input type="text" disabled style="width:45%;" value="'+jsondata.data.subtitle+'" />' +
                '<label class="editDescr" style="width:190px;">'+t('audioplayer','Add as Album Cover')+'</label> <input type="checkbox"  id="sAlbumCover" maxlength="4" style="width:10%;"  />' +
                '</div><div class="edit-right">'+posterAction+'</div>'
            );
            $("#dialogSmall").html(html);

            if(jsondata.data.poster !== ''){
                $this.loadPhoto();
            }

            var optartists=[];
            $(jsondata.data.artists).each(function(i,el){
                if(jsondata.data.artist == el.name){
                    optartists[i] = $('<option />').attr({'value':el.name,'selected':'selected'}).text(el.name);
                }else{
                    optartists[i] = $('<option />').attr('value',el.name).text(el.name);
                }

            });
            $('#eArtist').append(optartists);

            var optalbums=[];
            $(jsondata.data.albums).each(function(i,el){
                if(jsondata.data.album == el.name){
                    optalbums[i] = $('<option />').attr({'value':el.name,'selected':'selected'}).text(el.name);
                }else{
                    optalbums[i] = $('<option />').attr('value',el.name).text(el.name);
                }

            });
            $('#eAlbum').append(optalbums);

            var optgenres=[];
            $(jsondata.data.genres).each(function(i,el){
                if(jsondata.data.genre == el.name){
                    optgenres[i] = $('<option />').attr({'value':el.name,'selected':'selected'}).text(el.name);
                }else{
                    optgenres[i] = $('<option />').attr('value',el.name).text(el.name);
                }
            });
            $('#eGenre').append(optgenres);

            $this.loadActionPhotoHandlers();
            $this.loadPhotoHandlers();

            $('#phototools li a').click(function() {
                $(this).tooltip('hide');
            });

            $('#pinPhoto').on('mouseenter', function() {
                $('#phototools').slideDown(200);
            });
            $('#pinPhoto').on('mouseleave', function() {
                $('#phototools').slideUp(200);
            });

            $('#phototools').hover(function() {
                $(this).removeClass('transparent');
            }, function() {
                $(this).addClass('transparent');
            });

            $("#dialogSmall").dialog({
                resizable : false,
                title : t('audioplayer', 'Edit metadata'),
                width : 600,
                modal : true,
                buttons : [{
                    text : t('audioplayer', 'Close'),
                    click : function() {
                        $("#dialogSmall").html('');
                        $(this).dialog("close");
                    }
                }, {
                    text : t('audioplayer', 'Save'),
                    click : function() {
                        var oDialog = $(this);

                        $.ajax({
                            type : 'POST',
                            url : OC.generateUrl('apps/audioplayer/saveaudiofiledata'),
                            data : {
                                songFileId:fileId,
                                trackId:songId,
                                year: $('#sYear').val(),
                                title: $('#sTitle').val(),
                                artist: $('#sArtist').val(),
                                existartist: $('#eArtist').val(),
                                album: $('#sAlbum').val(),
                                existalbum: $('#eAlbum').val(),
                                track: $('#sTrack').val(),
                                tracktotal: $('#sTracktotal').val(),
                                genre: $('#sGenre').val(),
                                existgenre: $('#eGenre').val(),
                                addcover: $('#sAlbumCover').is(':checked'),
                                imgsrc: $('#imgsrc').val(),
                                imgmime: $('#imgmimetype').val()
                            },
                            success : function(jsondata) {
                                if(jsondata.status === 'success'){
                                    if(jsondata.data.albumid !== jsondata.data.oldalbumid){
                                        if(	$('.sm2-bar-ui').hasClass('playing')){
                                            $this.AudioPlayer.actions.play(0);
                                            $this.AudioPlayer.actions.stop();
                                        }
                                        $('#alben').addClass('active');
                                        $this.AlbumContainer.html('');
                                        $this.AlbumContainer.show();
                                        $this.PlaylistContainer.hide();
                                        $('#individual-playlist').html('');
                                        $('.albumwrapper').removeClass('isPlaylist');
                                        $this.ActivePlaylist.html('');
                                        $('.sm2-playlist-target').html('');
                                        $('.sm2-playlist-cover').css('background-color','#ffffff').html('');
                                        $this.loadAlbums();
                                    }
                                    if(jsondata.data.imgsrc !== ''){
                                        $('.albumcover[data-album="album-'+jsondata.data.albumid+'"]')
                                            .css({
                                                'background-image':'url('+jsondata.data.imgsrc+')',
                                                '-webkit-background-size':'cover',
                                                '-moz-background-size':'cover',
                                                'background-size':'cover'
                                            })
                                            .text('');

                                        $('.songcontainer[data-album="album-'+jsondata.data.albumid+'"]')
                                            .css({
                                                'background-color':jsondata.data.prefcolor,
                                            });

                                        $('.songcontainer[data-album="album-'+jsondata.data.albumid+'"] .songcontainer-cover')
                                            .css({
                                                'background-image':'url('+jsondata.data.imgsrc+')',
                                                '-webkit-background-size':'cover',
                                                '-moz-background-size':'cover',
                                                'background-size':'cover'
                                            })
                                            .text('');

                                    }

                                    $("#dialogSmall").html('');
                                    oDialog.dialog("close");
                                }else if(jsondata.status === 'error_write'){
                                    $('#notification').text(t('audioplayer','Missing permission to edit metadata of track!'));
                                    $('#notification').slideDown();
                                    window.setTimeout(function(){$('#notification').slideUp();}, 3000);
                                }else if(jsondata.status === 'error'){
                                    $('#notification').text(t('audioplayer',jsondata.msg));
                                    $('#notification').slideDown();
                                    window.setTimeout(function(){$('#notification').slideUp();}, 3000);
                                }
                            }
                        });

                    }
                }],
            });
            return false;
        }
        if(jsondata.status === 'error'){
            $('#notification').text(t('audioplayer','Missing permission to edit metadata of track!'));
            $('#notification').slideDown();
            window.setTimeout(function(){$('#notification').slideUp();}, 3000);
        }
    });
};

Audios.prototype.initPhotoDialog = function(){
    /* Initialize the photo edit dialog */

    $('#edit_photo_dialog').dialog({
        autoOpen : false,
        modal : true,
        position : {
            my : "left top+100",
            at : "left+40% top",
            of : $('#body-user')
        },
        height : 'auto',
        width : 'auto',
        buttons:[
            {
                text : t('core', 'OK'),
                click : function() {

                    myAudios.savePhoto(this);
                    $('#coords input').val('');
                    $(this).dialog('close');
                }
            },
            {
                text :  t('core', 'Cancel'),
                click : function() {
                    //$('#coords input').val('');
                    $.ajax({
                        type : 'POST',
                        url : OC.generateUrl('apps/audioplayer/clearphotocache'),
                        data : {
                            'tmpkey' : $('#tmpkey').val(),
                        },
                        success : function(data) {

                        }

                    });
                    $(this).dialog('close');
                }
            }
        ]
    });

    $('input#pinphoto_fileupload').fileupload({
        dataType : 'json',
        url : OC.generateUrl('apps/audioplayer/uploadphoto'),
        done : function(e, data) {

            this.imgSrc = data.result.imgdata;
            this.imgMimeType = data.result.mimetype;
            $('#imgsrc').val(this.imgSrc);
            $('#imgmimetype').val(this.imgMimeType);
            $('#tmpkey').val(data.result.tmp);
            this.editPhoto($('#photoId').val(), data.result.tmp);
        }.bind(this)
    });
};


Audios.prototype.loadPhoto = function() {
    var refreshstr = '&refresh=' + Math.random();
    $('#phototools li a').tooltip('hide');
    $('#pin_details_photo').remove();

    var ImgSrc = '';
    if (this.imgSrc !== false) {
        ImgSrc = this.imgSrc;
    }

    var newImg = $('<img>').attr('id', 'pin_details_photo').css({'width':'150px'}).attr('src', 'data:' + this.imgMimeType + ';base64,' + ImgSrc);
    newImg.prependTo($('#pinPhoto'));

    $('#noimage').remove();

    //$('#pinContainer').removeClass('forceOpen');
};

Audios.prototype.loadPhotoHandlers = function() {
    var phototools = $('#phototools');
    phototools.find('li a').tooltip('hide');
    phototools.find('li a').tooltip();
    if ($('#isphoto').val() === '1') {
        phototools.find('.delete').show();
        phototools.find('.edit').show();
    } else {
        phototools.find('.delete').hide();
        phototools.find('.edit').hide();
    }

    phototools.find('.upload').show();
    phototools.find('.cloud').show();

};

Audios.prototype.loadActionPhotoHandlers= function() {
    var phototools = $('#phototools');

    phototools.find('.delete').click(function(evt) {
        $(this).tooltip('hide');
        $('#pinContainer').addClass('forceOpen');
        this.deletePhoto();
        $(this).hide();
    }.bind(this));

    phototools.find('.edit').click(function() {
        $(this).tooltip('hide');
        $('#pinContainer').addClass('forceOpen');
        this.editCurrentPhoto();
    }.bind(this));

    phototools.find('.upload').click(function() {
        $(this).tooltip('hide');
        $('#pinContainer').addClass('forceOpen');
        $('#pinphoto_fileupload').trigger('click');
    });

    phototools.find('.cloud').click(function() {
        $(this).tooltip('hide');
        //$('#pinContainer').addClass('forceOpen');
        var mimeparts = ['image/jpeg', 'httpd/unix-directory'];
        OC.dialogs.filepicker(t('audioplayer', 'Select picture'), this.cloudPhotoSelected.bind(this), false, mimeparts, true);
    }.bind(this));

};

Audios.prototype.cloudPhotoSelected = function(path) {
    $.getJSON(OC.generateUrl('apps/audioplayer/getimagefromcloud'), {
        'path' : path,
        'id' : $('#photoId').val()
    }, function(jsondata) {
        if (jsondata) {

            this.editPhoto(jsondata.id, jsondata.tmp);
            $('#tmpkey').val(jsondata.tmp);
            this.imgSrc = jsondata.imgdata;
            this.imgMimeType = jsondata.mimetype;

            $('#imgsrc').val(this.imgSrc);
            $('#imgmimetype').val(this.imgMimeType);
            $('#edit_photo_dialog_img').html(jsondata.page);
        } else {
            OC.dialogs.alert(jsondata.message, t('audioplayer', 'Error'));
        }
    }.bind(this));
};

Audios.prototype.showCoords= function (c) {
    $('#cropform input#x1').val(c.x);
    $('#cropform input#y1').val(c.y);
    $('#cropform input#x2').val(c.x2);
    $('#cropform input#y2').val(c.y2);
    $('#cropform input#w').val(c.w);
    $('#cropform input#h').val(c.h);
};

Audios.prototype.editCurrentPhoto = function() {
    this.editPhoto($('#photoId').val(), $('#tmpkey').val());
};

Audios.prototype.editPhoto = function(id, tmpkey) {
    $.ajax({
        type : 'POST',
        url : OC.generateUrl('apps/audioplayer/cropphoto'),
        data : {
            'tmpkey' : tmpkey,
            'id' : id,
        },
        success : function(data) {
            $('#edit_photo_dialog_img').html(data);

            $('#cropbox').attr({'src': 'data:' + this.imgMimeType + ';base64,' + this.imgSrc}).show();

            $('#cropbox').Jcrop({
                onChange : this.showCoords,
                onSelect : this.showCoords,
                minSize : [140, 140],
                maxSize : [500, 500],
                bgColor : 'black',
                bgOpacity : 0.4,
                aspectRatio: 1,
                boxWidth : 500,
                boxHeight : 500,
                setSelect : [150, 150, 50, 50]//,
                //aspectRatio: 0.8
            });
        }.bind(this)
    });

    if ($('#edit_photo_dialog').dialog('isOpen') === true) {
        $('#edit_photo_dialog').dialog('moveToTop');
    } else {
        $('#edit_photo_dialog').dialog('open');
    }
};

Audios.prototype.savePhoto = function() {
    var target = $('#crop_target');
    var form = $('#cropform');
    var wrapper = $('#pin_details_photo_wrapper');
    var self = this;

    wrapper.addClass('wait');
    form.submit();

    target.load(function() {
        $('#noimage').text(t('audioplayer', 'Picture generating, please wait…')).addClass('icon-loading');
        var response = jQuery.parseJSON(target.contents().text());
        if (response !== undefined) {
            $('#isphoto').val('1');

            this.imgSrc = response.dataimg;
            this.imgMimeType = response.mimetype;
            $('#noimage').text('').removeClass('icon-loading');
            $('#imgsrc').val(this.imgSrc);
            $('#imgmimetype').val(this.imgMimeType);
            this.loadPhoto();
            this.loadPhotoHandlers();

        } else {
            OC.dialogs.alert(response.message, t('audioplayer', 'Error'));
            wrapper.removeClass('wait');
        }
    }.bind(this));
};

Audios.prototype.deletePhoto = function() {

    $('#isphoto').val('0');
    this.imgSrc = false;
    $('#pin_details_photo').remove();
    $('<div/>').attr('id', 'noimage').text(t('audioplayer', 'Drag picture here!')).prependTo($(' #pinPhoto'));
    $('#imgsrc').val('');
    this.loadPhotoHandlers();

};