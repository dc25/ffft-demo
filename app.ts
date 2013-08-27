/// <reference path="angularjs/angular.d.ts" />

class multiplier {
    constructor($scope) {
        $scope.m0 = "";
        $scope.m1 = "";

        $scope.digitize0 = (m0: string, m1: string): string[] => {
            var maxlen = Math.max(m0.length, m1.length);
            if (maxlen == 0) {
                return ['0'];
            }

            var plen = 1;
            while (plen < maxlen)
            {
                plen *= 2;
            }
            plen *= 2;

            var padded = Array(plen - m0.length + 1).join('0') + m0;
            return padded.split('');
        }

        $scope.transformationRows = (m0: string, m1: string): number[] => {
            var maxlen = Math.max(m0.length, m1.length);

            var plen = 1;
            var rowCount = 0;
            while (plen < maxlen)
            {
                plen *= 2;
                rowCount += 1;
            }
            plen *= 2;
            rowCount += 1;

            var res = [];
            for (var i = 0; i < rowCount; i++) {
                res.push(i);
            }
            return res;
        }

        $scope.transformationColumns = (m0: string, m1: string): number[]=> {
            var maxlen = Math.max(m0.length, m1.length);

            var columnCount = 1;
            var rowCount = 0;
            while (columnCount < maxlen)
            {
                columnCount *= 2;
                rowCount += 1;
            }
            columnCount *= 2;
            rowCount += 1;

            var res = [];
            for (var i = 0; i < columnCount; i++) {
                res.push(i);
            }
            return res;
        }

    }
}
