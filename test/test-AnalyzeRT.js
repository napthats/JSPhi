/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 11/12/15
 * Time: 0:45
 * To change this template use File | Settings | File Templates.
 */

test("empty retweetUserIDs or followeerIDs", function() {
    expect(3);
    same(AnalyzeRT.getFolloweerRT([], 1, [1, 2, 3]), [[], []], "empty retweetUserIDs return empty arrays pair");
    same(AnalyzeRT.getFolloweerRT([1, 2, 3], 1, []), [[], []], "empty followeerIDs return empty arrays pair");
    same(AnalyzeRT.getFolloweerRT([], 1, []), [[], []], "empty retweetUserIDs and followeerIDs return empty arrays pair");
});

test("all followeer appear in retweets and return both of beforeIDs and afterIDs", function() {
    expect(6);
    same(AnalyzeRT.getFolloweerRT([1,2,3], 2, [1,3]), [[1],[3]], "3 retweets (most simple pattern)");
    same(AnalyzeRT.getFolloweerRT([2,3,1], 3, [1,2]), [[2],[1]], "random order 3 retweets");
    same(AnalyzeRT.getFolloweerRT([1,2,3,4,5], 3, [1,5]), [[1],[5]], "5 retweets");
    same(AnalyzeRT.getFolloweerRT([5,4,3,1,2], 3, [2,5]), [[5],[2]], "random order 5 retweets");
    same(AnalyzeRT.getFolloweerRT([5,4,3,1,2,11,12,13,14,15], 3, [13,15,4]), [[4],[13,15]], "many retweets");
    same(AnalyzeRT.getFolloweerRT([5,18,3,1,2,11,12,13,14,15,4], 3, [13,4,15,18]), [[18],[13,15,4]], "many retweets 2");
});

test("some followeer appear in retweets and return both of beforeIDs and afterIDs", function() {
    expect(1);
    same(AnalyzeRT.getFolloweerRT([5,4,3,1,2,11,12,13,14,15], 3, [13,15,4,100,101]), [[4],[13,15]], "many retweets");
});

