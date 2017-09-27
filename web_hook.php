<?php
error_reporting(1);
$target = __DIR__; // 生产环境web目录
$token = 'feds3os4h2f8s4k';
$file = fopen("pull_log.txt","a");

$params = substr(urldecode(file_get_contents('php://input')), 5);
//fwrite($file, $params."\r\n");

$json = json_decode($params, true);
if (empty($json['password']) || $json['password'] !== $token) {
    exit('error request');
}

if($json['hook_name'] == 'merge_request_hooks' && $json['push_data']['target_branch'] == "release" && $json['push_data']['merge_status']=='can_be_merged'){
	$cmds = array(
	    "cd ./",
	    "git pull",
	    "rm -rf Application/Runtime"
	);
	foreach ($cmds as $cmd) {
		fwrite($file, shell_exec($cmd)."\r\n");
	}
}

//提交代码自动更新
if($json['hook_name'] == 'push_hooks' && $json['push_data']['ref'] == "refs/heads/release"){
	$cmds = array(
	    "cd ./",
	    "git pull",
	    "rm -rf Application/Runtime"
	);
	foreach ($cmds as $cmd) {
		fwrite($file, shell_exec($cmd)."\r\n");
	}
}


fclose($file);