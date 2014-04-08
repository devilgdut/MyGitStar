// 管理star页面的脚本
$(document).ready(function () {
	"use strict";

	var isUpdating = false;
	var shortTimeOut = 10000;
	var updateTimeOut = 60000;

	// 为导航菜单加active
	var active = $('#navHeader').attr('data-active');
	if (active) {
		$('#' + active).addClass('active');
	}

	// 更新按钮
	$('#btnUpdate').click(function (e) {
		e.preventDefault();
		if (!isUpdating) {
			$.ajax({
				type: 'POST',
				timeout: updateTimeOut,
				url: '/ajaxUpdateFromGithub',
				success: function (data) {
					data = JSON.parse(data);
					if (data.status) {
						var $success = $('<div class="row alert alert-success alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>' + data.message + '</p></div>');
						$success.prependTo($('.infoBox')[0]);
					} else {
						var $error = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>' + data.message + '</p></div>');
						$error.prependTo($('.infoBox')[0]);
					}
				},
				// ajax失败
				error: function () {
					var $error = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>更新超时</p></div>');
					$error.prependTo($('.infoBox')[0]);
				}
			});
		} else {
			var show = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>正在更新，请勿重复提交。</p></div>');
			show.prependTo($('.infoBox')[0]);
		}
	});

	// 备注提示
	$('.tab-content').mouseover(function (e) {
		$(e.target).closest('li').tooltip('show');
	});

	// 点击分类tab，显示对应content
	$('#myTab a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});

	// 为第一个标签页和标签内容加active
	$('#myTab').find('li').first().addClass('active');
	$('.tab-content').find('div').first().addClass('active in');

	// 点击某个star项目，显示modal，事件委托在tab-content父元素上
	$('.tab-content').click(function (e) {
		e.preventDefault();
		var $li = $(e.target).closest('li');
		var text = $li.find('.star-name').text();
		var description = $li.find('.star-description').text();
		var owner = $li.find('.star-owner').text();
		var $myModal = $('#myModal');
		// 信息数据
		$myModal.find('.modal-id').val($li.attr('data-id'));
		$myModal.find('.modal-title').text(text);
		$myModal.find('.modal-owner').text(owner);
		$myModal.find('.modal-language').text($li.find('.star-language').text());
		$myModal.find('.modal-starNum').text($li.attr('data-starNum'));
		$myModal.find('.modal-forkNum').text($li.attr('data-forkNum'));
		$myModal.find('.modal-repoId').text('ID: ' + $li.attr('data-id'));
		$myModal.find('.modal-description').text(description);
		$myModal.find('.modal-htmlurl').attr({'href': $li.attr('data-htmlurl')});
		$myModal.find('.modal-readme').attr({'href': '/readme?author=' + owner + '&repo=' + text});
		$myModal.find('.modal-size').text($li.attr('data-size') + 'KB');
		// 表单数据
		var category = $li.attr('data-category');
		$myModal.find('.modal-category input').text(category);
		$myModal.find('.modal-category input').val(category);
		// var tags = $li.attr('data-tags').split(',').join(' ');
		// $myModal.find('.modal-tags input').text(tags);
		// $myModal.find('.modal-tags input').val(tags);
		var remark = $li.attr('data-remark');
		$myModal.find('.modal-remark textarea').text(remark);
		$myModal.find('.modal-remark textarea').val(remark);
		$('#myModal').modal();
	});

	$('#deleteItemBtn').click(function (event) {
		event.preventDefault();
		var starid = $(this).closest('.modal').find('.modal-repoId').text().slice(4);
		var requestData = {
			starid: starid,
			action: 'delete'
		};
		if (!isUpdating) {
			$.ajax({
				type: 'POST',
				timeout: shortTimeOut,
				url: '/ajaxPost',
				data: requestData,
				success: function (data) {
					data = JSON.parse(data);
					if (data.status) {
						var $li = $('#star-' + data.starid);
						var $category = $li.closest('div.tab-pane');

						if ($li.length) {
							if ($category.length) {
								// 解决li之后的编号
								$li.nextAll().each(function () {
									var order = $(this).find('.item-order').text();
									$(this).find('.item-order').text(--order);
								});
								$li.remove();

								if ($category.find('li').length === 0) {
									var id = $category.attr('id');
									id = id.replace('content', 'tab');
									$('#' + id).remove();
									$category.remove();
									var $first = $('div.tab-pane').first();
									$first.addClass('active in');
									var newid = $first.attr('id');
									newid = newid.replace('content', 'tab');
									$('#' + newid).addClass('active');
								} else {
									// 减少old tab记录的数量
									var id2 = $category.attr('id');
									id2 = id2.replace('content', 'tab');
									$('#' + id2).find('.badge').text($category.find('li').length);
								}
								var total = $('#sidebar').find('.total').text();
								$('#sidebar').find('.total').text(--total);
							}
							var $success = $('<div class="row alert alert-success alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>更新成功</p></div>');
							$success.prependTo($('.infoBox')[0]);
						} else {
							var $error = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>找不到元素</p></div>');
							$error.prependTo($('.infoBox')[0]);
						}
					} else {
						// ajax失败 
						var deleteError = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>' + data.message + '</p></div>');
						deleteError.prependTo($('.infoBox')[0]);
					}
				},
				error: function () {
					var $error = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>更新超时</p></div>');
					$error.prependTo($('.infoBox')[0]);
				}
			});
		} else {
			$('#myModal').modal('hide');
			var show = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>请等待上次操作反馈后再提交更新..</p></div>');
			show.prependTo($('.infoBox')[0]);
		}
	});

	// 按星数量排序
	$('#sortByStar').click(function (event) {
		event.preventDefault();
		var ol = $('.tab-pane.active').find('ol');
		var liSet = ol.find('li');
		var tmpSet = [];
		liSet.each(function () {
			var num = Number($(this).attr('data-starNum'));
			var tmp = {};
			tmp.num = num;
			tmp.li = $(this);
			tmpSet.push(tmp);
		});
		tmpSet = tmpSet.sort(function (itemA, itemB) { return itemB.num - itemA.num; });
		tmpSet.forEach(function (item, index) {
			item.li.find('.item-order').text(index + 1);
			item.li.remove();
			item.li.appendTo(ol);
		});
	});

	// 按创建star时间排序
	var timeDirection = true;
	$('#sortByTime').click(function (event) {
		event.preventDefault();
		var ol = $('.tab-pane.active').find('ol');
		var liSet = ol.find('li');
		var tmpSet = [];
		liSet.each(function () {
			var order = Number($(this).attr('data-order'));
			var tmp = {};
			tmp.order = order;
			tmp.li = $(this);
			tmpSet.push(tmp);
		});
		if (timeDirection) {
			tmpSet = tmpSet.sort(function (itemA, itemB) { return itemA.order - itemB.order; });
		} else {
			tmpSet = tmpSet.sort(function (itemA, itemB) { return itemB.order - itemA.order; });
		}
		timeDirection = !timeDirection;
		tmpSet.forEach(function (item, index) {
			item.li.find('.item-order').text(index + 1);
			item.li.remove();
			item.li.appendTo(ol);
		});
	});

	// 表单处理
	$('#myModal form').submit(function (event) {
		event.preventDefault();
		var requestData = $(this).serialize();
		requestData += '&action=update';
		if (!isUpdating) {
			$.ajax({
				type: 'POST',
				timeout: shortTimeOut,
				url: '/ajaxPost',
				data: requestData,
				success: function (data) {
					data = JSON.parse(data);
					// ajax成功
					if (data.status) {
						var $li = $('#star-' + data.starid);
						$li.attr({'data-remark': data.remark});
						$li.attr({'data-original-title': data.remark});
						// $li.attr({'data-tags': data.tags});
						$li.attr({'data-category': data.category});
						// 将category进行编码
						var result = [];
						for (var j = 0; j < data.category.length; j++) {
							result.push(data.category.charCodeAt(j));
						}
						data.categoryCodes = result.join('-');
						var $category = $('#content-' + data.categoryCodes);

						if ($li.length) {
							if ($category.length) {
								var $oldCategory = $li.closest('div.tab-pane');
								if (data.categoryCodes === $oldCategory.attr('id').replace('content-', '')) {
									// 分类不变
								} else {
									// 解决li之后的编号
									$li.nextAll().each(function () {
										var order = $(this).find('.item-order').text();
										$(this).find('.item-order').text(--order);
									});
									var newOl = $category.find('ol').first();
									$li.find('.item-order').text(newOl.find('li').length + 1);
									$li.appendTo(newOl);
									// 如果旧分类走了li之后长度为0
									if ($oldCategory.find('li').length === 0) {
										var id = $oldCategory.attr('id');
										id = id.replace('content', 'tab');
										$('#' + id).remove();
										$oldCategory.remove();
										$category.addClass('active in');
										var newid = $category.attr('id');
										newid = newid.replace('content', 'tab');
										$('#' + newid).addClass('active');
									} else {
										// 减少old tab记录的数量
										var id3 = $oldCategory.attr('id');
										id3 = id3.replace('content', 'tab');
										$('#' + id3).find('.badge').text($oldCategory.find('li').length);
									}
									// 增加new tab记录的数量
									var id4 = $category.attr('id');
									id4 = id4.replace('content', 'tab');
									$('#' + id4).find('.badge').text($category.find('li').length);
								}
								var $success = $('<div class="row alert alert-success alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>更新成功</p></div>');
								$success.prependTo($('.infoBox')[0]);
							} else {
								// 旧分类
								var $oldCategory2 = $li.closest('div.tab-pane');

								// 解决li之后的编号
								$li.nextAll().each(function () {
									var order = $(this).find('.item-order').text();
									$(this).find('.item-order').text(--order);
								});

								$li.find('.item-order').text('1');

								var $newCategory = $('<div id="content-' + data.categoryCodes +
									'" class="tab-pane fade"><section id="star"><ol></ol></section></div>');
								$newCategory.appendTo($('div.tab-content')[0]);
								var $ol = $newCategory.find('ol').first();
								$li.prependTo($ol);
								var $newTab = $('<li id="tab-' + data.categoryCodes + '"><a data-toggle="tab" href="#content-' + data.categoryCodes + '">' + data.category + '<span class="badge">1</span></a></li>');
								$newTab.appendTo($('#myTab')[0]);

								if ($oldCategory2.find('li').length === 0) {
									var id5 = $oldCategory2.attr('id');
									id5 = id5.replace('content', 'tab');
									$('#' + id5).remove();
									$oldCategory2.remove();
									$newTab.addClass('active');
									$newCategory.addClass('active in');
								} else {
									// 减少old tab记录的数量
									var id6 = $oldCategory2.attr('id');
									id6 = id6.replace('content', 'tab');
									$('#' + id6).find('.badge').text($oldCategory2.find('li').length);
								}
								var submitSuccess = $('<div class="row alert alert-success alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>更新成功</p></div>');
								submitSuccess.prependTo($('.infoBox')[0]);
							}
						} else {
							var $error = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>找不到元素</p></div>');
							$error.prependTo($('.infoBox')[0]);
						}
					} else {
						// ajax失败 
						var submitError = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>' + data.message + '</p></div>');
						submitError.prependTo($('.infoBox')[0]);
					}
				},
				error: function () {
					var $error = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>更新超时</p></div>');
					$error.prependTo($('.infoBox')[0]);
				}
			});
		} else {
			$('#myModal').modal('hide');
			var show = $('<div class="row alert alert-danger alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>请等待上次操作反馈后再提交更新..</p></div>');
			show.prependTo($('.infoBox')[0]);
		}
	});

	// ajax事件提示
	$(document).ajaxStart(function () {
		var $loading = $('<div id="loading-info" class="row alert alert-info alert-dismissable"><button class="close" type="button" data-dismiss="alert" aria-hidden="true">&times;</button><p>正在更新，等待服务器反馈..</p></div>');
		$loading.prependTo($('.infoBox')[0]);
		console.log('loading');
		isUpdating = true;
		$('#myModal').modal('hide');
	}).ajaxStop(function () {
		$('#loading-info').remove();
		console.log('done');
		isUpdating = false;
	});
});