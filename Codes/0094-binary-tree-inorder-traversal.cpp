/*
 * @Author: LetMeFly
 * @Date: 2022-06-28 16:53:29
 * @LastEditors: LetMeFly
 * @LastEditTime: 2022-06-28 16:54:37
 */
#ifdef _WIN32
#include "_[1,2]toVector.h"
#endif

/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
private:
    vector<int> ans;
    void dfs(TreeNode* root) {
        if (!root)
            return;
        dfs(root->left);
        ans.push_back(root->val);
        dfs(root->right);
    }
public:
    vector<int> inorderTraversal(TreeNode* root) {
        dfs(root);
        return ans;
    }
};