angular.module('app-container-geo.admin',[
    'app-container-file'
])
.directive('layerAdmin',['$log','Layer','File','FileMeta','NotificationService',function($log,Layer,File,FileMeta,NotificationService){
    return {
        restrict: 'E',
        templateUrl: 'js/admin/layer-admin.html',
        scope: {},
        link: function($scope,$element,$attrs) {
            function listFiles() {
                $scope.files = File.query({});
            }
            listFiles();

            $scope.fileResource = File;
            $scope.$watch('fileToUpload',function(file) {
                console.log('fileToUpload',file);
                if(file && file.file && file.$save) {
                    file.metadata = {
                        index: 0,
                        foo: 'bar',
                        bool: true
                    };
                    file.$save(function(f){
                        $scope.uploadedFile = f;
                        delete $scope.fileToUpload;
                        listFiles();
                    });
                }
            });
            $scope.$watch('uploadedFile',function(file){
                if(file) {
                    if(file.contentType !== 'application/zip') {
                        NotificationService.addError({statusText: file.fileName+' is not a zip file.'});
                        file.$remove({id: file._id},function(){
                            $log.debug('removed '+file.fileName);
                            delete $scope.uploadedFile;
                        },NotificationService.addError);
                    }
                    console.log('uploadedFile',file);
                }
            });
            $scope.update = function(f) {
                var file = new File(angular.extend({},f));
                file.metadata.index++;
                file.$update({id: f._id},listFiles);
            };
            $scope.remove = function(f) {
                (new File(f)).$remove({id: f._id},function(){
                    $log.debug('removed '+f.fileName);
                    listFiles();
                },NotificationService.addError);
            };
        }
    };
}]);
